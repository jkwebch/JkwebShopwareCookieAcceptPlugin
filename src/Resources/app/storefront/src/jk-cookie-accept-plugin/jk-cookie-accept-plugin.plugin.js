import Plugin from 'src/plugin-system/plugin.class';
import { COOKIE_CONFIGURATION_UPDATE } from 'src/plugin/cookie/cookie-configuration.plugin';
import LoadingIndicator from 'src/utility/loading-indicator/loading-indicator.util';
import HttpClient from 'src/service/http-client.service';
import CookieStorage from 'src/helper/storage/cookie-storage.helper';

export default class JkCookieAcceptPlugin extends Plugin {
    static options = {
        acceptButtonSelector: '.js-cookie-accept-button',
        acceptButtonLoadingIndicatorSelector: '.js-cookie-accept-button-loading-indicator',
        cookieSelector: '[data-cookie]',
        cookiePreference: 'cookie-preference'
    };

    init() {
        document.$emitter.subscribe(COOKIE_CONFIGURATION_UPDATE, (ev) => {
            const detail = ev.detail;
            for (const cookie in detail) {
                if (detail.hasOwnProperty(cookie)) {
                    if (typeof(window.dataLayer) !== 'undefined' && Array.isArray(window.dataLayer)) {
                        if (detail[cookie]) {
                            window.dataLayer.push({
                                'event': 'enableCookie',
                                'name': cookie
                            });
                        } else {
                            window.dataLayer.push({
                                'event': 'disableCookie',
                                'name': cookie
                            });
                        }
                    }
                }
            }
        });

        const { acceptButtonSelector, acceptButtonLoadingIndicatorSelector, cookiePreference } = this.options;
        const that = this;

        $(acceptButtonSelector + ':not(.disabled)').on('click', function() {
            const cookieConfiguration = window.PluginManager.getPluginInstances('CookieConfiguration')[0];
            const $btn = $(this).find('button');
            $btn.addClass('disabled');
            const $loadingIndicator = $btn.find(acceptButtonLoadingIndicatorSelector);
            $loadingIndicator.html(`<span class="offcanvas-content-container">${LoadingIndicator.getTemplate()}</span>`);

            const url = window.router['frontend.cookie.offcanvas'];
            const client = new HttpClient(window.accessKey, window.contextToken);
            client.get(url, (data) => {
                const dataContext = $(`<div>${data}</div>`);
                that._setInitialState(dataContext, cookieConfiguration);
                const activeCookies = that._getCookies(dataContext, cookieConfiguration, 'all');
                const activeCookieNames = [];

                activeCookies.forEach(({ cookie, value, expiration }) => {
                    activeCookieNames.push(cookie);

                    if (cookie && value) {
                        CookieStorage.setItem(cookie, value, expiration);
                    }
                });

                CookieStorage.setItem(cookiePreference, '1', '30');

                cookieConfiguration._handleUpdateListener(activeCookieNames, []);

                $btn.removeClass('disabled');
                $loadingIndicator.html('');
                cookieConfiguration._hideCookieBar();

                if (window.COOKIE_ACCEPT_RELOAD === 1) {
                    location.reload();
                }
            });
        });
    }

    _setInitialState(ctx, cookieConfiguration) {
        const cookies = this._getCookies(ctx, cookieConfiguration, 'all');
        const activeCookies = [];
        const inactiveCookies = [];

        cookies.forEach(({ cookie, required }) => {
            const isActive = CookieStorage.getItem(cookie);
            if (isActive || required) {
                activeCookies.push(cookie);
            } else {
                inactiveCookies.push(cookie);
            }
        });

        cookieConfiguration.lastState = {
            active: activeCookies,
            inactive: inactiveCookies
        };

        activeCookies.forEach(activeCookie => {
            const target = $(`[data-cookie="${activeCookie}"]`, ctx)[0];

            target.checked = true;
            cookieConfiguration._childCheckboxEvent(target);
        });
    }

    _getCookies(ctx, cookieConfiguration, type = 'all') {
        const { cookieSelector } = this.options;

        return Array.from($(cookieSelector, ctx)).filter(cookieInput => {
            switch (type) {
                case 'all': return true;
                case 'active': return cookieConfiguration._isChecked(cookieInput);
                case 'inactive': return !cookieConfiguration._isChecked(cookieInput);
                default: return false;
            }
        }).map(filteredInput => {
            const { cookie, cookieValue, cookieExpiration, cookieRequired } = filteredInput.dataset;
            return { cookie, value: cookieValue, expiration: cookieExpiration, required: cookieRequired };
        });
    }
}
