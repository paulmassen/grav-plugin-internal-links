<?php

declare(strict_types=1);

require __DIR__ . '/../../api/tests/bootstrap.php';
require __DIR__ . '/../classes/LanguagePrefixController.php';

use Grav\Common\Config\Config;
use Grav\Common\Grav;
use Grav\Common\Language\Language;

function checkPrefix(array $languages, bool $includeDefault, ?string $lang, string $expected): void
{
    Grav::resetInstance();
    $grav = Grav::instance();
    $grav['config'] = new Config(['system' => ['languages' => [
        'supported' => $languages,
        'include_default_lang' => $includeDefault,
    ]]]);
    $language = new Language($grav);
    $actual = $language->getLanguageURLPrefix($lang);
    if ($actual !== $expected) {
        throw new RuntimeException("Expected '{$expected}', got '{$actual}'.");
    }
}

checkPrefix([], false, 'fr', '');
checkPrefix(['fr', 'en'], false, 'fr', '');
checkPrefix(['fr', 'en'], false, 'en', '/en');
checkPrefix(['fr', 'en'], true, 'fr', '/fr');
echo "Grav language prefix tests: OK\n";
