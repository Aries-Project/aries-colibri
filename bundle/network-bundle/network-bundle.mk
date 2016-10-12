NETWORK_BUNDLE_NAME = network
NETWORK_BUNDLE_ORDER = 030
NETWORK_BUNDLE_VERSION = v$(shell date +%Y%m%d)
NETWORK_BUNDLE_LICENSE = GPLv2
NETWORK_BUNDLE_LICENSE_FILES = COPYING

NETWORK_BUNDLE_PACKAGES = libcurl libmcrypt wireless_tools wpa_supplicant ifplugd ifupdown iptables gesftpserver libtirpc nfs-utils avahi

$(eval $(bundle-package))
