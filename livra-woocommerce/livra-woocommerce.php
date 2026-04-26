<?php
/**
 * Plugin Name: Livra – Delivery Integration
 * Plugin URI:  https://livra.md
 * Description: Trimite comenzile WooCommerce automat către platforma Livra pentru optimizare trasee.
 * Version:     1.0.0
 * Author:      Livra
 * License:     GPL-2.0+
 * Text Domain: livra
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'LIVRA_VERSION', '1.0.0' );
define( 'LIVRA_OPTION_URL', 'livra_webhook_url' );
define( 'LIVRA_OPTION_KEY', 'livra_api_key' );

// ── Settings page ─────────────────────────────────────────────────────────────

add_filter( 'woocommerce_settings_tabs_array', 'livra_add_settings_tab', 50 );
function livra_add_settings_tab( $tabs ) {
    $tabs['livra'] = __( 'Livra', 'livra' );
    return $tabs;
}

add_action( 'woocommerce_settings_tabs_livra', 'livra_render_settings' );
function livra_render_settings() {
    woocommerce_admin_fields( livra_get_settings() );
}

add_action( 'woocommerce_update_options_livra', 'livra_save_settings' );
function livra_save_settings() {
    woocommerce_update_options( livra_get_settings() );
}

function livra_get_settings() {
    return [
        [
            'title' => __( 'Setări Livra', 'livra' ),
            'type'  => 'title',
            'desc'  => __( 'Configurează integrarea cu platforma Livra pentru livrare optimizată.', 'livra' ),
            'id'    => 'livra_section_start',
        ],
        [
            'title'    => __( 'URL Webhook', 'livra' ),
            'type'     => 'text',
            'desc'     => __( 'Exemplu: http://localhost:8000/webhook/orders', 'livra' ),
            'id'       => LIVRA_OPTION_URL,
            'default'  => 'http://localhost:8000/webhook/orders',
            'css'      => 'min-width:400px;',
            'desc_tip' => true,
        ],
        [
            'title'    => __( 'Cheie API (opțional)', 'livra' ),
            'type'     => 'password',
            'desc'     => __( 'Trimisă ca header X-Livra-Key dacă este setată.', 'livra' ),
            'id'       => LIVRA_OPTION_KEY,
            'default'  => '',
            'css'      => 'min-width:400px;',
            'desc_tip' => true,
        ],
        [
            'type' => 'sectionend',
            'id'   => 'livra_section_end',
        ],
    ];
}

// ── Order hooks ───────────────────────────────────────────────────────────────

// Trigger on payment received (Processing) — covers most payment gateways
add_action( 'woocommerce_order_status_processing', 'livra_send_order', 10, 1 );

// Also trigger on Completed for COD orders that skip Processing
add_action( 'woocommerce_order_status_completed', 'livra_send_order_if_not_sent', 10, 1 );

function livra_send_order_if_not_sent( $order_id ) {
    if ( ! get_post_meta( $order_id, '_livra_sent', true ) ) {
        livra_send_order( $order_id );
    }
}

function livra_send_order( $order_id ) {
    $webhook_url = get_option( LIVRA_OPTION_URL );
    if ( empty( $webhook_url ) ) {
        return;
    }

    $order = wc_get_order( $order_id );
    if ( ! $order ) {
        return;
    }

    $shipping = $order->get_address( 'shipping' );
    $billing  = $order->get_address( 'billing' );

    // Build delivery address from shipping (fallback to billing)
    $addr_parts = array_filter( [
        $shipping['address_1'] ?: $billing['address_1'],
        $shipping['address_2'] ?: $billing['address_2'],
        $shipping['city']      ?: $billing['city'],
    ] );
    $address = implode( ', ', $addr_parts );

    // Customer name: prefer shipping, fallback to billing
    $first = $shipping['first_name'] ?: $billing['first_name'];
    $last  = $shipping['last_name']  ?: $billing['last_name'];
    $name  = trim( "$first $last" ) ?: $billing['company'] ?: 'Client';

    // Phone from billing (WooCommerce doesn't collect shipping phone by default)
    $phone = $billing['phone'] ?? '';

    // Order notes
    $notes = $order->get_customer_note();

    $payload = [
        'order_id'         => (string) $order_id,
        'customer_name'    => $name,
        'customer_phone'   => $phone,
        'delivery_address' => $address,
        'notes'            => $notes,
    ];

    $headers = [ 'Content-Type' => 'application/json' ];
    $api_key = get_option( LIVRA_OPTION_KEY );
    if ( ! empty( $api_key ) ) {
        $headers['X-Livra-Key'] = $api_key;
    }

    $response = wp_remote_post( $webhook_url, [
        'method'  => 'POST',
        'headers' => $headers,
        'body'    => wp_json_encode( $payload ),
        'timeout' => 10,
    ] );

    if ( is_wp_error( $response ) ) {
        $order->add_order_note(
            sprintf( __( 'Livra: eroare trimitere – %s', 'livra' ), $response->get_error_message() )
        );
        return;
    }

    $code = wp_remote_retrieve_response_code( $response );
    if ( $code >= 200 && $code < 300 ) {
        update_post_meta( $order_id, '_livra_sent', 1 );
        $order->add_order_note( __( 'Livra: comanda trimisă cu succes pentru livrare.', 'livra' ) );
    } else {
        $body = wp_remote_retrieve_body( $response );
        $order->add_order_note(
            sprintf( __( 'Livra: răspuns neașteptat %d – %s', 'livra' ), $code, $body )
        );
    }
}

// ── Admin notice if not configured ───────────────────────────────────────────

add_action( 'admin_notices', 'livra_maybe_show_setup_notice' );
function livra_maybe_show_setup_notice() {
    if ( ! current_user_can( 'manage_woocommerce' ) ) {
        return;
    }
    if ( get_option( LIVRA_OPTION_URL ) ) {
        return;
    }
    $settings_url = admin_url( 'admin.php?page=wc-settings&tab=livra' );
    printf(
        '<div class="notice notice-warning is-dismissible"><p>%s <a href="%s">%s</a></p></div>',
        esc_html__( 'Livra este instalat dar nu este configurat.', 'livra' ),
        esc_url( $settings_url ),
        esc_html__( 'Configurează acum →', 'livra' )
    );
}
