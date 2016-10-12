TOOLS_BUNDLE_NAME = tools
TOOLS_BUNDLE_ORDER = 050
TOOLS_BUNDLE_VERSION = v$(shell date +%Y%m%d)
TOOLS_BUNDLE_LICENSE = GPLv2
TOOLS_BUNDLE_LICENSE_FILES = COPYING

TOOLS_BUNDLE_PACKAGES = strace avrdude

$(eval $(bundle-package))
