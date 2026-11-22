<?php

declare(strict_types=1);

namespace Grav\Plugin\InternalLinks;

use Grav\Plugin\Api\Controllers\AbstractApiController;
use Grav\Plugin\Api\Exceptions\ValidationException;
use Grav\Plugin\Api\Response\ApiResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class LanguagePrefixController extends AbstractApiController
{
    public function show(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'api.pages.read');
        $lang = $request->getQueryParams()['lang'] ?? null;
        $language = $this->grav['language'];
        if ($lang !== null && (!is_string($lang) || $lang === '')) {
            throw new ValidationException('Language code must be a non-empty string.');
        }
        if ($language->enabled() && ($lang === null || !$language->validate($lang))) {
            throw new ValidationException('A supported content language is required.');
        }
        return ApiResponse::create(['prefix' => $language->getLanguageURLPrefix($lang)]);
    }
}
