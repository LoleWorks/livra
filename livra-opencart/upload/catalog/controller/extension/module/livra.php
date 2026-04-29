<?php
class ControllerExtensionModuleLivra extends Controller {
    public function sendOrder(&$route, &$args, &$output) {
        if (!$this->config->get('module_livra_status')) {
            return;
        }

        $webhook_url = $this->config->get('module_livra_webhook_url');
        if (empty($webhook_url)) {
            return;
        }

        $order_id        = (int)($args[0] ?? 0);
        $order_status_id = (int)($args[1] ?? 0);

        if (!$order_id) {
            return;
        }

        // Only fire for the configured trigger status (default: 2 = Processing)
        $trigger = (int)$this->config->get('module_livra_status_id') ?: 2;
        if ($order_status_id !== $trigger) {
            return;
        }

        $this->load->model('checkout/order');
        $order = $this->model_checkout_order->getOrder($order_id);
        if (!$order) {
            return;
        }

        // Build delivery address from shipping, fallback to payment
        $addr = array_filter([
            $order['shipping_address_1'] ?: $order['payment_address_1'],
            $order['shipping_address_2'] ?: $order['payment_address_2'],
            $order['shipping_city']      ?: $order['payment_city'],
        ]);
        $address = implode(', ', $addr);

        $shipping_name = trim($order['shipping_firstname'] . ' ' . $order['shipping_lastname']);
        $payment_name  = trim($order['payment_firstname']  . ' ' . $order['payment_lastname']);

        $payload = json_encode([
            'order_id'         => (string)$order_id,
            'customer_name'    => $shipping_name ?: $payment_name ?: 'Client',
            'customer_phone'   => $order['telephone'] ?? '',
            'delivery_address' => $address,
            'notes'            => $order['comment'] ?? '',
        ]);

        $headers = ['Content-Type: application/json'];
        $api_key = $this->config->get('module_livra_api_key');
        if (!empty($api_key)) {
            $headers[] = 'X-Api-Key: ' . $api_key;
        }

        $ch = curl_init($webhook_url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
        ]);
        curl_exec($ch);
        curl_close($ch);
    }
}
