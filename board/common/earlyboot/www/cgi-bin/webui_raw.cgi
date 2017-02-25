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
	# url: cgi-bin/webui_raw.cgi?GET
	GET)
		;;
	# url: cgi-bin/webui_raw.cgi?SET&id=ID&value=VAL
	SET)
		echo "$RESP_VALUE" > $WEBUI_FIFO
		# Wait for confirmation
		while read unlock; do true; done < $WEBUI_BFIFO
		;;
esac

FIRST="y"

cat $WEBUI_DB
