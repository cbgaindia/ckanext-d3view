# encoding: utf-8

import ckan.plugins as p
import ckan.plugins.toolkit as toolkit

default = toolkit.get_validator(u'default')
boolean_validator = toolkit.get_validator(u'boolean_validator')
not_empty = toolkit.get_validator('not_empty')


class DataVizBaseView(p.SingletonPlugin):
    """
    DataViz view plugin
    """
    if not p.toolkit.check_ckan_version('2.3'):
        raise p.toolkit.CkanVersionException(
            'This extension requires CKAN >= 2.3. If you are using a ' +
            'previous CKAN version the PDF viewer is included in the main ' +
            'CKAN repository.')

    p.implements(p.IConfigurer, inherit=True)
    p.implements(p.IConfigurable, inherit=True)
    p.implements(p.IResourceView, inherit=True)

    def update_config(self, config):
        """
        Set up the resource library, public directory and
        template directory for the view
        """
        p.toolkit.add_public_directory(config, 'public')
        p.toolkit.add_template_directory(config, 'templates')
        p.toolkit.add_resource('assets', 'dataviz')


    def can_view(self, data_dict):
        resource = data_dict['resource']
        return resource.get(u'datastore_active')

    def view_template(self, context, data_dict):
        return u'base_view.html'

    def form_template(self, context, data_dict):
        return u'base_form.html'
    
    def setup_template_variables(self, context, data_dict):
        resource = data_dict['resource']
        resource_view = data_dict['resource_view']
        resource_view['download_url'] = data_dict['resource']['url']

        return {'resource': resource,
                'resource_view': resource_view,
                'group_by_is_required': False,
                'chart_type': 'base'}

    def info(self):
        return {
            u'name': u'dataviz_view',
            u'title': u'Bar Chart',
            u'default_title': u'Graph',
            u'always_available': True,
            u'icon': u'bar-chart',
            u'schema': {
                u'responsive': [default(False), boolean_validator],
                u'chart_title': [default('')],
                u'x_axis_title': [default('')],
                u'y_axis_title': [default('')]
            }
        }
