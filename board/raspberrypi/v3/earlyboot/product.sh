#!/bin/bash

reset_totumduino()
{
	true
}

## @fn custom_firstboot_begin()
## Execute custom commands upon entering firstboot
custom_firstboot_begin()
{
	true
}

## @fn custom_firstboot_end()
## Execute custom commands upon leaving firstboot
custom_firstboot_end()
{
	webui_redirect "/" 20
	sleep 1
}

## @fn custom_normal_begin()
## Execute custom commands upon entering earlyboot
custom_normal_begin()
{
	true
}

## @fn custom_normal_end()
## Execute custom commands upon user aborted recovery 
custom_recovery_aborted()
{
	true
}

## @fn custom_normal_end()
## Execute custom commands upon leaving earlyboot
custom_normal_end()
{
	true
}

## @fn custom_recovery_begin()
## Execute custom commands upon entering emergency procedure
custom_recovery_begin()
{
	true
}

## @fn custom_recovery_end()
## Execute custom commands upon leaving emergency procedure
custom_recovery_end()
{
	true
}

## @fn custom_recovery_condition()
## Condition for entering recovery mode.
custom_recovery_condition()
{
	false
}

## @fn custom shutdown code
## These instructions are executed when poweroff is requested
## after all the processes have been stopped
custom_shutdown_end()
{
	true
}

## @fn custom reboot code
## These instructions are executed when reboot is requested
## after all the processes have been stopped
custom_reboot_end()
{
	true
}
