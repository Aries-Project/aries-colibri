PYTHON_BUNDLE_NAME = python
PYTHON_BUNDLE_ORDER = 021
PYTHON_BUNDLE_VERSION = v$(shell date +%Y%m%d)
PYTHON_BUNDLE_LICENSE = GPLv2
PYTHON_BUNDLE_LICENSE_FILES = COPYING

ifeq ($(BR2_PACKAGE_PYTHON3),y)
PYTHON_BUNDLE_PACKAGES = python3
else
PYTHON_BUNDLE_PACKAGES = python
endif

PYTHON_BUNDLE_PACKAGES += python-cffi python-pycparser python-serial python-rpi-gpio python-picamera
PYTHON_BUNDLE_PACKAGES += python-numpy python-scipy python-pyyaml python-pathtools python-watchdog 

PYTHON_BUNDLE_PACKAGES += python-shapely geos
# pyro4
#~ PYTHON_BUNDLE_PACKAGES += python-six python-serpent python-selectors34 python-pyro4
# Web
PYTHON_BUNDLE_PACKAGES += python-autobahn python-txaio python-six

$(eval $(bundle-package))
