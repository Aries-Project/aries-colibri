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
var ajaxIsBusy = false;
var ajaxWaitingFor = null;
var queryQueue = null;
var userResponse = false;
var redirectActive = false;
var redirectTimeout = 0;
var redirectTimer = null;
var redirectURL = null;

/**
 * Add CSS class to a HTML element with <id>
 * 
 * @param id 		HTML element id
 * @param cssClass	HTML element class to be added
 * 
 **/ 
function addCSSClassToElementsStartsWithId( id, cssClass ) {
	var children = document.body.getElementsByTagName('*');
	var child;
	for (var i = 0, length = children.length; i < length; i++) {
		child = children[i];
		if (child.id.substr(0, id.length) == id)
		{
			child.classList.add(cssClass);
		}
	}
}

/**
 * Set CSS class to a HTML element with <id>
 * 
 * @param id 		HTML element id
 * @param cssClass	HTML element class
 * 
 **/ 
function setCSSClassToElementsStartsWithId( id, cssClass ) {
	var children = document.body.getElementsByTagName('*');
	var child;
	for (var i = 0, length = children.length; i < length; i++) {
		child = children[i];
		if (child.id.substr(0, id.length) == id)
		{
			child.className = cssClass;
		}
	}
}

function myTimer()
{
	if(ajaxWaitingFor == null)
	{
		ajaxWaitingFor = "get";
		loadXMLDoc("cgi-bin/webui.cgi?GET");
	}
}

function redirectTimerCallback()
{
	if(redirectTimeout)
	{
		redirectTimeout--;
		clearInterval(redirectTimer);
		redirectTimer = setTimeout(function(){redirectTimerCallback()}, 1000);
		
		document.getElementById("webui-redirect-timeout").innerHTML = "Redirecting in " + redirectTimeout + " sec";
	}
	else
	{
		window.location.assign(redirectURL);
	}
}

function scheduleReload()
{
	if(!redirectActive)
	{
		clearInterval(reloadTimer);
		reloadTimer = setTimeout(function(){myTimer()},600);
	}
}

/**
 * Callback function used by the webui items to send the user-response 
 * back to the server.
 * 
 * @param item_id	HTML element id
 * @param resp		Response value
 * 
 **/ 
function webuiResponde(item_id, resp)
{	
	resp_escaped = escape(resp);
	queryString = "cgi-bin/webui.cgi?SET&id=" + item_id + "&value=" + resp_escaped;
	if(ajaxWaitingFor == "get")
		ajaxWaitingFor = "drop";
	else
		ajaxWaitingFor = "set";
		
	setCSSClassToElementsStartsWithId("item"+item_id, "pure-button pure-button-disabled");
	
	loadXMLDoc(queryString);
}

function webuiRedirect(url, timeout)
{
	redirectActive = true;
	redirectTimeout = timeout;
	redirectURL = url;
	
	if(timeout == "0")
	{
		window.location.assign(url);
	}
	else
	{
		document.getElementById("webui-redirect-timeout").innerHTML = "Redirecting in " + timeout + " sec";
		redirectTimer = setTimeout(function(){redirectTimerCallback()}, 1000);
	}
}

function loadXMLDoc(query_string)
{
	var xmlhttp;
	
	if(ajaxIsBusy == true)
	{
		if(queryQueue == null)
		{
			queryQueue = query_string;
		}
		return;
	}
	
	if(window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else
	{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlhttp.onreadystatechange=function()
	{
		if(xmlhttp.readyState == 4)
		{
			if(xmlhttp.status == 200)
			{
				if(ajaxWaitingFor != "drop")
				{
					var content = unescape(xmlhttp.responseText);
					// Look for "<!-- redirect: * -->" string in the response
					// text as it contains the redirect url and timeout.
					var aa = content.match(/<!-- redirect:.*-->/g);
					if(aa)
					{
						// Remove comment symbols and tag
						var str = " " + aa + " ";
						var a = str.replace("<!-- redirect:", "");
						var a = a.replace("-->", "");
						var a = a.trim();
						
						// Add timeout indication container
						content += "<div id=\"webui-redirect-timeout\"></div>"
						document.getElementById("webui-content").innerHTML = content;
						
						// Redirect string is of format "<url>|<timeout>"
						// Split the string and extract url and timeout
						var b = a.split("|")
						if( (b[0] != null) && (b[1] != null) )
						{
							webuiRedirect(b[0], b[1]);	
						}
					}
					else
					{
						document.getElementById("webui-content").innerHTML = content;
					}
					
				}
				else
					ajaxWaitingFor = "set";
			}
			else
			{
				document.getElementById("webui-content").innerHTML = "<div>WebUI connection error.</div>";
			}
			
			ajaxIsBusy = false;
			if(queryQueue != null)
			{
				loadXMLDoc(queryQueue);
				queryQueue = null;
			}
			else
			{
				scheduleReload();
			}
			
			ajaxWaitingFor = null;
		}
		
	}
	
	ajaxIsBusy = true;
	xmlhttp.open("GET",query_string,true);
	xmlhttp.send();
}
