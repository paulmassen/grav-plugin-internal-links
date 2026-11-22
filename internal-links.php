<?php

declare(strict_types=1);

namespace Grav\Plugin;

use Grav\Common\Plugin;
use RocketTheme\Toolbox\Event\Event;

class InternalLinksPlugin extends Plugin
{
    public static function getSubscribedEvents(): array
    {
        return ['onApiMarkdownEditorButtons' => ['onApiMarkdownEditorButtons', 0]];
    }

    public function onApiMarkdownEditorButtons(Event $event): void
    {
        if (!$this->config->get('plugins.internal-links.enabled', true)) {
            return;
        }
        $buttons = $event['buttons'];
        $buttons[] = [
            'id' => 'internal-links',
            'plugin' => 'internal-links',
            'label' => 'Insérer un lien interne',
            'icon' => 'fa-link',
            'authorize' => 'api.pages.read',
            'modal' => [
                'component' => 'page-picker',
                'title' => 'Insérer un lien interne',
                'size' => 'lg',
            ],
        ];
        $event['buttons'] = $buttons;
    }
}
