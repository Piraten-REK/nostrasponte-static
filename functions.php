<?php
function ns_defer_js($tag, $handle, $src) {
    return '<script src="' . esc_url($url) . '"' . ($handle === 'main' ? ' type="module"' : '') . ' defer></script>';
}

add_filter('script_loader_tag', 'ns_defer_js', 10, 3);