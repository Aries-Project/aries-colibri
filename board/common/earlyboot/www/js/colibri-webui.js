/**
 * 
 * This file is part of colibri-earlyboot.
 * 
 * Copyright (C) 2016	Daniel Kesler <kesler.daniel@gmail.com>
 * 
 * Foobar is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Foobar is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

var reloadTimer = null;
var redirectTimer = null;
var earlyboot_status = {};

/* on document load */
$(function () { 
	
	earlyboot_status = {
		mode : "",
		suggestion : {
			applied : false,
			value: "",
		},
		log : "",
		content : "",
		update: false,
		progress : {
			active : false,
			min : 0,
			max : 0,
			value : 0
		},
		last_message : "",
		choice_id : 0,
		redirect : {
			active : false,
			timeout : 0,
			url : "",
			auto_url : ""
		}
	};	
	
	reloadContent();
	$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="popover"]').popover({trigger: "hover", placement: "bottom", container : "body"});
	$("#start-installation").on('click', startInstallation);
	$("#start-recovery").on('click', startRecovery);
	$("#boot").on('click', continueBoot);
	$(".chart").easyPieChart({
		size : 200,
		barColor: '#69c',
		trackColor: '#ace',
		scaleColor: false,
		lineWidth: 20,
		trackWidth: 16,
		lineCap: 'butt',
		animate: 500
    });
	$('#log')
		.on('hidden.bs.collapse', function () {	$("#show-log").html('<i class="fa fa-angle-double-down" aria-hidden="true"></i>');	})
		.on('shown.bs.collapse', function () {	$("#show-log").html('<i class="fa fa-angle-double-up" aria-hidden="true"></i>'); });
});

function rawToJson(data)
{
	/*
	<ID>@<TYPE>::<VALUE>
	*/

	//~ console.log(data);
	var json = {};
	var tmp = data.split("@");
	var id = tmp[0];
	var tags = tmp[1].split("::")
	var msg = ["generic", "working", "success", "error", "warninig", "info", "question"];
	json.id = id;
	json.type = tags[0];
	
	if(msg.indexOf(json.type) > -1)
	{
		json.subtype = json.type;
		json.type = "msg";
	}
	
	if(json.type == "choice" || json.type == "decision")
		json.value = tags[1].split("|");
	else
		json.value = tags[1];
	
	return json;
}

function interpretContentRaw(data)
{
	
	var old_content = earlyboot_status.content;
	var reload_sheduled = false;
	var old_redirect = earlyboot_status.redirect;
	var old_suggestion = earlyboot_status.suggestion;
	
	earlyboot_status = {
		mode : "",
		suggestion : old_suggestion,
		log : "",
		content : old_content,
		update: false,
		progress : {
			active : false,
			value : ""
		},
		last_message : "",
		choice_id : 0,
		redirect : old_redirect
	};
	
	console.log(data);
	var raw_items = data.split("\n");
	for(i in  raw_items)
	{
		if(raw_items[i])
		{
			var item = rawToJson(raw_items[i]);
			console.log(item);
			
			
			switch(item.type)
			{
				case "suggestion":
					earlyboot_status.suggestion.value = item.value;
					break;
				case "mode":
					earlyboot_status.mode = item.value;
					break;
				case "msg":
					//console.log(item.value);
					var item_class = "";
					switch(item.subtype)
					{
						case "generic":
							break;
						case "info":
							item_class = "fa fa-info-circle";
							break;
						case "working":
							item_class = "fa fa-cog rotating";
							break;
						case "success":
							item_class = "fa fa-check-circle";
							break;
						case "error":
							item_class = "fa fa-times-circle";
							break;
						case "warning":
							item_class = "fa fa-exclamation-triangle";
							break;
						case "question":
							item_class = "fa fa-question-circle fa-fw";
							break;
					}
					var log_entry = '<div id="'+item.id+'"><i class="'+item_class+'"></i> '+item.value+'</div>';
					earlyboot_status.log += log_entry;
					earlyboot_status.last_message = item.value;
					break;
				case "choice":
					var choice_entry = "";
					earlyboot_status.choice_id = item.id;
					break;
				case "decision":
					earlyboot_status.progress.value = 0;
					earlyboot_status.progress.max = 10;
					reload_sheduled = true;
					break;
				case "progress":
					earlyboot_status.progress.active = true;
					var tmp = item.value.split("/");
					earlyboot_status.progress.value = tmp[0];
					earlyboot_status.progress.max = tmp[1];
					reload_sheduled = true;
					break;
				case "redirect":
					var tmp = item.value.split("|");
					console.log(item.value, tmp);
					earlyboot_status.redirect.active = true;
					earlyboot_status.redirect.url = tmp[0];
					earlyboot_status.redirect.timeout = tmp[1];
					earlyboot_status.redirect.remaining = tmp[1];
					earlyboot_status.redirect.auto_url = tmp[2];
					reload_sheduled = false;
					earlyboot_status.mode = "countdown";
					countdown();
					break;
			}
			
			
		}
	}
	
	updateView(earlyboot_status);
	
	if(reload_sheduled)
	{
		scheduleReload();
	}
	
}

function reloadContent()
{
	console.log("reloadContent");

	$.get("cgi-bin/webui_raw.cgi?GET", function(data) {
		interpretContentRaw(data);
		
	}).fail(function() {
		console.log('ajax fail');
		scheduleReload();
		if(!earlyboot_status.redirect.active)
		{
			console.log('rescheduling');
			scheduleReload();
		}
		else
		{
			console.log('nya, not trying anymore');
		}
	});
}

function scheduleReload(timeout = 600)
{
	if(!earlyboot_status.redirect.active)
	{
		clearInterval(reloadTimer);
		reloadTimer = setTimeout(function(){reloadContent()},timeout);
	}
}

function countdown()
{
	$("#countdown").html(earlyboot_status.redirect.remaining);
	var percent = earlyboot_status.redirect.remaining*100 / earlyboot_status.redirect.timeout;
	$('.chart').data('easyPieChart').update(percent);
	//$(".chart").prop('data-percent', percent);
	
	if(earlyboot_status.redirect.remaining > 0)
	{
		redirectTimer = setTimeout(function(){countdown()},1000);
	}
	else
	{
		window.location.assign(earlyboot_status.redirect.url);
		return;
	}
	
	earlyboot_status.redirect.remaining -= 1;
	
	/* automatic redirect in case the target is online before the countdown */
	if(earlyboot_status.redirect.auto_url)
	{
		$.get(earlyboot_status.redirect.auto_url, function(data) {
			console.log('redirect target is alive');
			earlyboot_status.redirect.active = false;
			clearTimeout(redirectTimer);
			window.location.assign(earlyboot_status.redirect.url);
		}).fail(function() {
			console.log('redirect target is not ready yet');
		});
	}
	
}

function updateView(status)
{
	console.log(status);
	
	switch(status.mode)
	{
		case "firstboot":
			firstbootView(status);
			break;
		case "recovery":
		case "forced-recovery":
			recoveryView(status);
			break;
		case "countdown":
			countdownView(status);
			break;
		default:
			break;
	}
	
	if(!status.suggestion.applied)
	{
		$("#preserve-settings").prop('checked', true);
		$("#preserve-files").prop('checked', true);
		
		switch(status.suggestion.value)
		{
			case "lite-reinstall":
				$(".settings-checkbox").popover({
					trigger: "hover", 
					placement: "bottom",
					container : "body",
					title : "Corrupted",
					content : "System partition is corrupted. Cannot preserve settings."});
				
				$("#preserve-settings").prop("disabled", true);
				$("#preserve-settings").prop('checked', false);
				break;
			case "full-reinstall":
				$(".settings-checkbox").popover({
					trigger: "hover", 
					placement: "bottom",
					container : "body",
					title : "Corrupted",
					content : "System partition is corrupted. Cannot preserve settings."});
					
				$(".files-checkbox").popover({
					trigger: "hover", 
					placement: "bottom",
					container : "body",
					title : "Corrupted",
					content : "User data partition is corrupted. Cannot preserve user files."});
			
				$("#preserve-settings").prop("disabled", true);
				$("#preserve-settings").prop('checked', false);
				$("#preserve-files").prop("disabled", true);
				$("#preserve-files").prop('checked', false);
				break;
			default:
				break;
		}
			
		status.suggestion.applied = true;
	}
	
	var log_content = status.log; 
	
	$(".log-content").html(log_content);
	$("#current-message").html(status.last_message);
	if(status.progress.active)
	{
		var percent = (status.progress.value*100 / status.progress.max);
		console.log('percent', percent, status.progress.value, status.progress.max);
		$('.progress-bar').css('width', percent+'%').attr('aria-valuenow', percent);
	}
}

function countdownView(status)
{
	$("#firstboot-view").collapse("hide");
	$("#recovery-view").collapse("hide");
	$("#progress-view").collapse("hide");
	$("#countdown-view").collapse("show");
}

function recoveryView(status)
{
	if(status.progress.active)
	{
		$("#recovery-view").collapse("hide");
		$("#progress-view").collapse("show");
	}
	else
	{
		$("#progress-view").collapse("hide");
		$("#recovery-view").collapse("show");
	}
}

function startRecovery()
{
	$( ".action-button" ).prop( "disabled", true );
	$("#progress-title").html("Recovery");
	console.log('start recovery');
	//USER_ACTION=$(webui_waitfor_response "Full Reinstall:1|Lite Reinstall:2|Restore Bundles:3|Boot:4")
	var pre_files = $("#preserve-files").prop('checked');
	var pre_settings = $("#preserve-settings").prop('checked');
	var action = 1;
	
	
	if(pre_files == false && pre_settings == false)
		action = 1;
	else if(pre_files == true && pre_settings == false)
		action = 2;
	else if(pre_files == true && pre_settings == true)
		action = 3;
	else if(pre_files == false && pre_settings == true)
		action = 3;
	
	console.log(pre_files, pre_settings, action);
	webuiSend(earlyboot_status.choice_id, action);
}

function firstbootView(status)
{
	if(status.progress.active)
	{
		$("#firstboot-view").collapse("hide");
		$("#progress-view").collapse("show");
	}
	else
	{
		$("#progress-view").collapse("hide");
		$("#firstboot-view").collapse("show");
	}
	$(".recovery-icon").prop('src', 'img/fabui_recovery_white.png');
}

function startInstallation()
{
	$( ".action-button" ).prop( "disabled", true );
	$(".recovery-icon").prop('src', 'img/fabui_recovery_white.png');
	$("#progress-title").html("OS Installation");
	console.log('start installtion');
	webuiSend(earlyboot_status.choice_id, 1);
}

function continueBoot()
{
	$( ".action-button" ).prop( "disabled", true );
	webuiSend(earlyboot_status.choice_id, 4);
}

function webuiSend(resp_id, resp_value)
{
	resp_escaped = escape(resp_value);
	url = "cgi-bin/webui_raw.cgi?SET&id=" + resp_id + "&value=" + resp_escaped;
	$.get(url, function(data) {
		console.log(data);
		interpretContentRaw(data);
		scheduleReload();
	})
}
