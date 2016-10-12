CORE_BUNDLE_NAME = core
CORE_BUNDLE_ORDER = 001
CORE_BUNDLE_VERSION = v$(shell date +%Y%m%d)
CORE_BUNDLE_LICENSE = GPLv2
CORE_BUNDLE_LICENSE_FILES = COPYING

CORE_BUNDLE_PACKAGES = busybox dcron dosfstools kmod ncurses readline tzdata fake-hwclock zlib sudo nano dropbear logrotate popt inotify-tools acl attr rsync
CORE_BUNDLE_ADD_ROOTFS = YES

$(eval $(bundle-package))
