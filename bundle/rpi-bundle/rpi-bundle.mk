RPI_BUNDLE_NAME = rpi
RPI_BUNDLE_ORDER = 060
RPI_BUNDLE_VERSION = v$(shell date +%Y%m%d)
RPI_BUNDLE_LICENSE = 
RPI_BUNDLE_LICENSE_FILES = 

RPI_BUNDLE_PACKAGES = rpi-userland

$(eval $(bundle-package))
