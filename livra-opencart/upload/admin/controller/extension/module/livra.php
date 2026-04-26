<?php
class ControllerExtensionModuleLivra extends Controller {
    private $error = [];

    public function index() {
        $this->load->language('extension/module/livra');
        $this->document->setTitle($this->language->get('heading_title'));
        $this->load->model('setting/setting');

        if ($this->request->server['REQUEST_METHOD'] == 'POST' && $this->validate()) {
            $this->model_setting_setting->editSetting('module_livra', $this->request->post);
            $this->session->data['success'] = $this->language->get('text_success');
            $this->response->redirect($this->url->link(
                'marketplace/extension',
                'user_token=' . $this->session->data['user_token'] . '&type=module',
                true
            ));
        }

        $data = [];

        if (isset($this->error['warning'])) {
            $data['error_warning'] = $this->error['warning'];
        } else {
            $data['error_warning'] = '';
        }

        $data['breadcrumbs'] = [
            [
                'text' => $this->language->get('text_home'),
                'href' => $this->url->link('common/dashboard', 'user_token=' . $this->session->data['user_token'], true),
            ],
            [
                'text' => $this->language->get('text_extension'),
                'href' => $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=module', true),
            ],
            [
                'text' => $this->language->get('heading_title'),
                'href' => $this->url->link('extension/module/livra', 'user_token=' . $this->session->data['user_token'], true),
            ],
        ];

        $data['action'] = $this->url->link('extension/module/livra', 'user_token=' . $this->session->data['user_token'], true);
        $data['cancel'] = $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=module', true);

        $fields = ['module_livra_webhook_url', 'module_livra_api_key', 'module_livra_status_id', 'module_livra_status'];
        foreach ($fields as $field) {
            $data[$field] = $this->request->post[$field] ?? $this->config->get($field);
        }

        // Default trigger status: Processing (2)
        if (empty($data['module_livra_status_id'])) {
            $data['module_livra_status_id'] = 2;
        }

        $this->load->model('localisation/order_status');
        $data['order_statuses'] = $this->model_localisation_order_status->getOrderStatuses();

        $data['header']      = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer']      = $this->load->controller('common/footer');

        $this->response->setOutput($this->load->view('extension/module/livra', $data));
    }

    public function install() {
        $this->load->model('setting/event');
        $this->model_setting_event->addEvent(
            'livra',
            'catalog/model/checkout/order/addOrderHistory/after',
            'extension/module/livra/sendOrder'
        );
    }

    public function uninstall() {
        $this->load->model('setting/event');
        $this->model_setting_event->deleteEventByCode('livra');
    }

    protected function validate() {
        if (!$this->user->hasPermission('modify', 'extension/module/livra')) {
            $this->error['warning'] = $this->language->get('error_permission');
        }
        return !$this->error;
    }
}
