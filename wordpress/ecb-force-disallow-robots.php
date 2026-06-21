<?php
/**
 * Plugin Name: ECB Force Disallow Robots.txt
 * Description: This WordPress install is a headless WooCommerce backend, not a public site. Yoast SEO's own robots.txt block ignores the "discourage search engines" setting and explicitly allows crawling, so this forces a plain "Disallow: /" regardless of what Yoast or core would otherwise output.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Priority 99 so this runs after Yoast (and anything else) has had its say,
// and simply replaces whatever they produced.
add_filter('robots_txt', function () {
    return "User-agent: *\nDisallow: /\n";
}, PHP_INT_MAX);
