<?php declare(strict_types=1);

namespace Jkweb\Shopware\Plugin\CookieAccept\Framework\Cookie;

use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Storefront\Framework\Cookie\CookieProviderInterface;

class CustomCookieProvider implements CookieProviderInterface {

    private $originalService;
    /**
     * @var SystemConfigService
     */
    private $systemConfigService;

    /**
     * CustomCookieProvider constructor.
     * @param CookieProviderInterface $service
     * @param SystemConfigService $systemConfigService
     */
    public function __construct(CookieProviderInterface $service, SystemConfigService $systemConfigService)
    {
        $this->originalService = $service;
        $this->systemConfigService = $systemConfigService;
    }

    public function getCookieGroups(): array
    {
        $setting = $this->systemConfigService->get('JkwebShopwareCookieAcceptPlugin.config.cookies');
        if ($setting) {
            $setting = json_decode($setting, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $setting = [];
            }
        } else {
            $setting = [];
        }
        return array_merge(
            $this->originalService->getCookieGroups(),
            $setting
        );
    }
}
