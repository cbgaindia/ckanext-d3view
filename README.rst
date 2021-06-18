======================
ckanext-d3view
======================

.. Put a description of your extension here:
   What does it do? What features does it have?
   Consider including some screenshots or embedding a video!

CKAN Data Visualization plugin (Work in Progress)

------------
Requirements
------------

Tested with CKAN Version 2.6 and 2.8

------------
Installation
------------

.. Add any additional install steps to the list below.
   For example installing any non-Python dependencies or adding any required
   config settings.

To install ckanext-d3view:

1. Activate your CKAN virtual environment, for example::

     . /usr/lib/ckan/default/bin/activate

2. Clone repository and install the ckanext-d3view Python package into your virtual environment::

     python setup.py install

3. Add ``d3view`` to the ``ckan.plugins`` setting in your CKAN
   config file (by default the config file is located at
   ``/etc/ckan/default/production.ini``).

4. Restart CKAN. For example if you've deployed CKAN with Apache on Ubuntu::

     sudo service apache2 reload


------------------------
Development Installation
------------------------

To install ckanext-d3view for development, activate your CKAN virtualenv and
do::

    git clone https://github.com/cbgaindia/ckanext-d3view.git
    cd ckanext-d3view
    python setup.py develop

