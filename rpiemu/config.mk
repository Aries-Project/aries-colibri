COLIBRI_BUILDROOT_EXTERNAL	= $(TOP_DIR)/../aries-colibri
COLIBRI_BUILDROOT_DEFCONFIG = aries_rpi3_defconfig

#~ MODULES_DIR					= $(TOP_DIR)/../aries-colibri/rpiemu/modules

RPIEMU_RUN	= $(COLIBRI_BUILDROOT_EXTERNAL)/rpiemu/run.py

#~ KERNEL_VERSION			= 4.4.y
#~ RPI_RELEASE				= 1.20160523-1
#~ KERNEL_SOURCE 			= https://github.com/raspberrypi/linux/archive/raspberrypi-kernel_$(RPI_RELEASE).tar.gz
#~ KERNEL_TAR				= $(DOWNLOAD_DIR)/raspberrypi-kernel_$(RPI_RELEASE).tar.gz
#~ KERNEL_BUILD_DIR		= $(BUILD_DIR)/linux-raspberrypi-kernel_$(RPI_RELEASE)

#~ COLIBRI_FABTOTUM_ROOT 	?= ../colibri-fabtotum
#~ KERNEL_VERSION			?= 4.1.y
#~ KERNEL_VERSION			?= 4.4.y
#~ KERNEL_SOURCE 			= http://github.com/raspberrypi/linux/archive/rpi-$(KERNEL_VERSION).tar.gz
#~ KERNEL_BUILD_DIR		= $(BUILD_DIR)/linux-rpi-$(KERNEL_VERSION)
#~ KERNEL_TAR				= $(DOWNLOAD_DIR)/rpi-$(KERNEL_VERSION).tar.gz
#~ KERNEL_PATCH_DIR		= $(COLIBRI_FABTOTUM_ROOT)/board/fabtotum/v1/$(KERNEL_VERSION)
#~ KERNEL_PATCHES			= $(wildcard $(KERNEL_PATCH_DIR)/*.patch)
#~ KERNEL_CONFIG			= $(COLIBRI_FABTOTUM_ROOT)/board/fabtotum/v1/linux-$(KERNEL_VERSION)-qemu.config


#KERNEL_PATCH_DIR		?= $(COLIBRI_FABTOTUM_ROOT)/board/fabtotum/v3/$(KERNEL_VERSION)
#KERNEL_CONFIG			?= $(COLIBRI_FABTOTUM_ROOT)/board/fabtotum/v3/linux-$(KERNEL_VERSION)-qemu.config
#KERNEL_ARCH			?= arm
