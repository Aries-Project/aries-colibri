KERNEL_BUNDLE_NAME = kernel
KERNEL_BUNDLE_ORDER = 002
KERNEL_BUNDLE_VERSION = v$(shell date +%Y%m%d)

KERNEL_BUNDLE_PACKAGES = linux linux2 linux-firmware linux-firmware-extra

$(eval $(bundle-package))
