EXTRA_LIBS_BUNDLE_NAME = extra-libs
EXTRA_LIBS_BUNDLE_ORDER = 020
EXTRA_LIBS_BUNDLE_VERSION = v$(shell date +%Y%m%d)
EXTRA_LIBS_BUNDLE_LICENSE = GPLv2
EXTRA_LIBS_BUNDLE_LICENSE_FILES = COPYING

EXTRA_LIBS_BUNDLE_PACKAGES = openssl pcre libxml2 libyaml gettext icu libusb libusb-compat elfutils libffi libdaemon expat sqlite bzip2


$(eval $(bundle-package))
