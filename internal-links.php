<?php

declare(strict_types=1);

namespace Grav\Plugin;

use Grav\Common\Plugin;
use Grav\Plugin\Api\Services\PreferencesResolver;
use RocketTheme\Toolbox\Event\Event;

class InternalLinksPlugin extends Plugin
{
    public static function getSubscribedEvents(): array
    {
        return [
            'onApiMarkdownEditorButtons' => ['onApiMarkdownEditorButtons', 0],
            'onApiRegisterRoutes' => ['onApiRegisterRoutes', 0],
            'onPluginsInitialized' => ['onPluginsInitialized', 0],
        ];
    }

    public function onPluginsInitialized(): void
    {
        if (class_exists(\Grav\Plugin\Api\Controllers\AbstractApiController::class)) {
            require_once __DIR__ . '/classes/LanguagePrefixController.php';
        }
    }

    public function onApiRegisterRoutes(Event $event): void
    {
        if (!$this->config->get('plugins.internal-links.enabled', true)) {
            return;
        }
        require_once __DIR__ . '/classes/LanguagePrefixController.php';
        $event['routes']->get('/internal-links/language-prefix', [\Grav\Plugin\InternalLinks\LanguagePrefixController::class, 'show']);
    }

    public function onApiMarkdownEditorButtons(Event $event): void
    {
        if (!$this->config->get('plugins.internal-links.enabled', true)) {
            return;
        }
        $user = $event['user'] ?? null;
        $locale = 'en';
        if ($user && class_exists(PreferencesResolver::class)) {
            try {
                $locale = (new PreferencesResolver($this->grav))->resolve($user, false)['effective']['adminLanguage'] ?? 'en';
            } catch (\Throwable $exception) {
                // Keep the toolbar usable when preferences are unavailable.
            }
        }
        $locale = strtolower(explode('-', str_replace('_', '-', (string) $locale))[0]);
        $label = $this->grav['language']->translate('PLUGIN_INTERNAL_LINKS.INSERT_LINK', [$locale, 'en']);
        $buttons = $event['buttons'];
        $buttons[] = [
            'id' => 'internal-links',
            'plugin' => 'internal-links',
            'label' => $label,
            'icon' => 'fa-link',
            'authorize' => 'api.pages.read',
            'modal' => [
                'component' => 'page-picker',
                'title' => $label,
                'props' => ['toolbarLabel' => $label],
                'size' => 'lg',
            ],
        ];
        $event['buttons'] = $buttons;
    }
}
