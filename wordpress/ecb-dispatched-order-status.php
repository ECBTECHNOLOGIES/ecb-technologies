<?php
/**
 * Plugin Name: ECB Custom Order Status - Dispatched
 * Description: Adds a "Dispatched" WooCommerce order status between Processing and Completed, for the Fargo Courier handoff step. Set manually in wp-admin > Orders once a courier has picked up the order.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Register the underlying post status so it behaves like WooCommerce's
// built-in statuses (shows in admin order list, counts, etc).
add_action('init', function () {
    register_post_status('wc-dispatched', [
        'label'                     => 'Dispatched',
        'public'                    => true,
        'exclude_from_search'       => false,
        'show_in_admin_all_list'    => true,
        'show_in_admin_status_list' => true,
        'label_count'               => _n_noop(
            'Dispatched <span class="count">(%s)</span>',
            'Dispatched <span class="count">(%s)</span>'
        ),
    ]);
});

// Insert "Dispatched" into WooCommerce's status list, right after
// "Processing" so it shows in that order in wp-admin dropdowns and the
// orders list filter.
add_filter('wc_order_statuses', function ($order_statuses) {
    $new_statuses = [];
    foreach ($order_statuses as $key => $label) {
        $new_statuses[$key] = $label;
        if ('wc-processing' === $key) {
            $new_statuses['wc-dispatched'] = 'Dispatched';
        }
    }
    return $new_statuses;
});

// Treat "Dispatched" as a paid status (same as Processing/Completed) so
// it's included in sales reports and isn't mistaken for an unpaid order.
add_filter('woocommerce_order_is_paid_statuses', function ($statuses) {
    $statuses[] = 'dispatched';
    return $statuses;
});
