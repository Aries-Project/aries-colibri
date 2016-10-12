################################################################################
#
# avrdude-rpi
#
################################################################################

# Download avrdude-rpi fixes
AVRDUDE_EXTRA_DOWNLOADS = \
	https://raw.github.com/deanmao/avrdude-rpi/master/autoreset \
	https://raw.github.com/deanmao/avrdude-rpi/master/avrdude-autoreset

AVRDUDE_DEPENDENCIES += python-rpi-gpio strace

define AVRDUDE_FIX_ORIGINAL
	$(AVRDUDE_FAKEROOT) mv -f $(AVRDUDE_TARGET_DIR)/usr/bin/avrdude $(AVRDUDE_TARGET_DIR)/usr/bin/avrdude-original
	$(AVRDUDE_FAKEROOT) $(INSTALL) -D -m 755 $(BR2_DL_DIR)/autoreset $(AVRDUDE_TARGET_DIR)/usr/bin/autoreset
	$(AVRDUDE_FAKEROOT) echo "GPIO.cleanup()" >> $(AVRDUDE_TARGET_DIR)/usr/bin/autoreset
	$(AVRDUDE_FAKEROOT) $(INSTALL) -D -m 755 $(BR2_DL_DIR)/avrdude-autoreset $(AVRDUDE_TARGET_DIR)/usr/bin/avrdude-autoreset
	$(AVRDUDE_FAKEROOT) ln -sf /usr/bin/avrdude-autoreset $(AVRDUDE_TARGET_DIR)/usr/bin/avrdude
	sed "s@/dev/ttyS0@/dev/ttyAMA0@g" -i $(AVRDUDE_TARGET_DIR)/etc/avrdude.conf
endef

AVRDUDE_POST_INSTALL_TARGET_HOOKS += AVRDUDE_FIX_ORIGINAL
