<?php declare(strict_types=1);

namespace Jkweb\Shopware\Plugin\CookieAccept\Subscriber;

use BabyMarkt\DeepL\DeepL;
use Shopware\Core\Framework\Context;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Storefront\Event\StorefrontRenderEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Messenger\MessageBusInterface;

class StorefrontRenderSubscriber implements EventSubscriberInterface
{

    /** @var SystemConfigService */
    private $systemConfigService;

    public function __construct(SystemConfigService $systemConfigService)
    {
        $this->systemConfigService = $systemConfigService;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            StorefrontRenderEvent::class => 'onRender',
        ];
    }

    public function onRender(StorefrontRenderEvent $event): void
    {
        $event->setParameter("cookieAcceptReload", $this->systemConfigService->get("JkwebShopwareCookieAcceptPlugin.config.reload"));
        $event->setParameter("cookieAcceptLayout", $this->systemConfigService->get("JkwebShopwareCookieAcceptPlugin.config.layout"));
    }
}
