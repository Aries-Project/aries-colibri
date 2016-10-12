########################################################################
#
#  This file is part of colibri-earlyboot.
#  
#  Copyright (C) 2016	Daniel Kesler <kesler.daniel@gmail.com>
#  
#  Foobar is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#  
#  Foobar is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#  
#  You should have received a copy of the GNU General Public License
#  along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
#
########################################################################

. /lib/.config

# Generate MIME header
echo "Content-type: text/plain"
echo ""

CMD="GET"
RESP_ID="0"
RESP_VALUE=""

for p in $(echo $QUERY_STRING|awk -F'&' '{for(i=1;i<=NF;i++){print $i}}'); do
	key="${p%=*}"
	value="${p##*=}"
	#echo "<div>$p</div>"
	if [ "x$value" != "x$p" ]; then
		case $key in
			id)
				RESP_ID="$value"
				;;
			value)
				RESP_VALUE="$value"
				;;
		esac
	else
		CMD="$p"
	fi
done

case $CMD in
	GET)
		;;
	SET)
		echo "$RESP_VALUE" > $WEBUI_FIFO
		# Wait for confirmation
		while read unlock; do true; done < $WEBUI_BFIFO
		;;
esac

for item in $(cat $WEBUI_DB| sed 's/ /%20%/g'); do
	item=$(echo $item | sed 's/%20%/ /g')
	IID=${item%@*}
	item=${item##*@}
	T=${item%::*}
	V=${item##*::}
	case $T in
		success)
			echo "<div id=\"item${IID}\"><i class=\"fa fa-check-circle fa-fw\"></i> $V</div>"
			;;
		working)
			echo "<div id=\"item${IID}\"><i class=\"fa fa-cog rotating fa-fw\"></i> $V</div>"
			;;
		question)
			echo "<div id=\"item${IID}\"><i class=\"fa fa-question-circle fa-fw\"></i> $V</div>"
			;;
		choice)
			echo "<p>"
			for C in $(echo $V| sed 's/ /%20/g;s/|/ /g'); do
				CID=${C##*:}
				TXT=${C%:*}
				echo "<button id=\"item${IID}_${CID}\" onmouseup=\"webuiResponde($IID,$CID)\" class=\"pure-button pure-button-primary\">$TXT</button>"
			done
			echo "</p>"
			;;
		decision)
			echo "<p>"
			for C in $(echo $V| sed 's/ /%20/g;s/|/ /g'); do
				CID=${C##*:}
				TXT=${C%:*}
				if [ $CID != "x" ]; then
					echo "<button class=\"pure-button pure-button-disabled\"><i class=\"fa fa-hand-o-up\"></i> $TXT</button>"
				else
					echo "<button class=\"pure-button pure-button-disabled\">$TXT</button>"
				fi
			done
			echo "</p>"
			;;
		error)
			echo "<div id=\"item${IID}\"><i class=\"fa fa-times-circle\"></i> $V</div>"
			;;
		info)
			echo "<div id=\"item${IID}\"><i class=\"fa fa-info-circle\"></i> $V</div>"
			;;
		warning)
			echo "<div id=\"item${IID}\"><i class=\"fa fa-exclamation-triangle\"></i> $V</div>"
			;;
		-)
			echo "<div id=\"item${IID}\">$V</div>"
			;;
		# Skip comments
		\#*)
			;;
		redirect)
			#echo "<button class=\"pure-button pure-button-primary\" onmouseup=\"webuiRedirect('$V')\">REDIRECT</button>"
			echo "<!-- redirect: $V -->"
			;;
		*)
			echo "<div>$item</div>"
			;;
	esac
done

#dmesg | sed ':a;N;$!ba;s/\n/<br>/g'
