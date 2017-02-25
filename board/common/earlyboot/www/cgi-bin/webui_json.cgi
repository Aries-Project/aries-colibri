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
echo "Content-type: application/json"
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
	# url: cgi-bin/webui_json.cgi?GET
	GET)
		;;
	# url: cgi-bin/webui_json.cgi?SET&id=ID&value=VAL
	SET)
		echo "$RESP_VALUE" > $WEBUI_FIFO
		# Wait for confirmation
		while read unlock; do true; done < $WEBUI_BFIFO
		;;
esac

echo "{"

FIRST="y"

for item in $(cat $WEBUI_DB| sed 's/ /%20%/g'); do
	item=$(echo $item | sed 's/%20%/ /g')
	IID=${item%@*}
	item=${item##*@}
	T=${item%::*}
	V=${item##*::}
	
	if [ "$FIRST" == "y" ]; then
		FIRST="n"
	else
		echo ","
	fi
	
	case $T in
		success)
			V=$(echo $V | sed 's/"/\\"/g')
			echo -n "  \"item${IID}\" : {\"id\" : ${IID}, \"type\" : \"msg\", \"subtype\" : \"success\", \"value\" : \"$V\" }"
			;;
		working)
			V=$(echo $V | sed 's/"/\\"/g')
			echo -n "  \"item${IID}\" : {\"id\" : ${IID}, \"type\" : \"msg\", \"subtype\" : \"working\", \"value\" : \"$V\" }"
			;;
		question)
			V=$(echo $V | sed 's/"/\\"/g')
			echo -n "  \"item${IID}\" : {\"id\" : ${IID}, \"type\" : \"msg\", \"subtype\" : \"question\", \"value\" : \"$V\" }"
			;;
		suggestion)
			V=$(echo $V | sed 's/"/\\"/g')
			echo -n "  \"item${IID}\" : {\"id\" : ${IID}, \"type\" : \"suggestion\", \"value\" : \"$V\" }"
			;;
		progress)
			V=$(echo $V | sed 's/"/\\"/g')
			echo -n "  \"item${IID}\" : {\"id\" : ${IID}, \"type\" : \"progress\", \"value\" : \"$V\" }"
			;;
		mode)
			V=$(echo $V | sed 's/"/\\"/g')
			echo -n "  \"item${IID}\" : {\"id\" : ${IID}, \"type\" : \"mode\", \"value\" : \"$V\" }"
			;;
		choice)
			C_FIRST="y"
			
			echo "  \"item${IID}\" : { \"id\" : ${IID}, \"type\" : \"choice\", \"items\" : ["
			
			for C in $(echo $V| sed 's/ /%20/g;s/|/ /g'); do
				CID=${C##*:}
				TXT=$( echo ${C%:*} | sed 's/%20/ /g;s/"/\\"/g' )
				
				if [ "$C_FIRST" == "y" ]; then
					C_FIRST="n"
				else
					echo ","
				fi
				
				echo -n "    { \"value\" : \"$CID\", \"label\" : \"$TXT\" }"
			done
			echo
			echo "  ] }"
			;;
		decision)
			echo " \"item${IID}\" : {\"id\" : ${IID}, \"type\" : \"decision\", \"items\" : ["
			C_FIRST="y"
			
			for C in $(echo $V| sed 's/ /%20/g;s/|/ /g'); do
				CID=${C##*:}
				TXT=$( echo ${C%:*} | sed 's/%20/ /g;s/"/\\"/g' )
				
				if [ "$C_FIRST" == "y" ]; then
					C_FIRST="n"
				else
					echo ","
				fi
				
				if [ $CID != "x" ]; then
					echo -n "    { \"label\" : \"$TXT\", \"selected\" : true }"
				else
					echo -n "    { \"label\" : \"$TXT\", \"selected\" : false }"
				fi
			done
			echo "  ] }"
			;;
		error)
			V=$(echo $V | sed 's/"/\\"/g')
			echo -n "  \"item${IID}\" : {\"id\" : ${IID}, \"type\" : \"msg\", \"subtype\" : \"error\", \"value\" : \"$V\" }"
			;;
		info)
			V=$(echo $V | sed 's/"/\\"/g')
			echo -n "  \"item${IID}\" : {\"id\" : ${IID}, \"type\" : \"msg\", \"subtype\" : \"info\", \"value\" : \"$V\" }"
			;;
		warning)
			V=$(echo $V | sed 's/"/\\"/g')
			echo -n "  \"item${IID}\" : {\"id\" : ${IID}, \"type\" : \"msg\", \"subtype\" : \"warning\", \"value\" : \"$V\" }"
			;;
		-)
			V=$(echo $V | sed 's/"/\\"/g')
			echo -n "  \"item${IID}\" : {\"id\" : ${IID}, \"type\" : \"msg\", \"subtype\" : \"generic\", \"value\" : \"$V\" }"
			;;
		# Skip comments
		\#*)
			;;
		redirect)
			#echo "<button class=\"pure-button pure-button-primary\" onmouseup=\"webuiRedirect('$V')\">REDIRECT</button>"
			#echo "<!-- redirect: $V -->"
			# U=${V%|*}
			# T=${V##*|}
			U=$(echo $V | awk 'BEGIN{FS="|"} {print $1}')
			T=$(echo $V | awk 'BEGIN{FS="|"} {print $2}')
			A=$(echo $V | awk 'BEGIN{FS="|"} {print $3}')

			echo -n "  \"item${IID}\" : {\"id\" : ${IID}, \"type\" : \"redirect\", \"url\" : \"$U\", \"timeout\" : $T, \"auto_url\" : $A }"
			;;
		*)
			V=$(echo $V | sed 's/"/\\"/g')
			echo -n "  \"item${IID}\" : {\"id\" : ${IID}, \"type\" : \"none\", \"value\" : \"$V\" }"
			;;
	esac
done

echo "}"

#dmesg | sed ':a;N;$!ba;s/\n/<br>/g'
