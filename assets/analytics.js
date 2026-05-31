(() => {
  const MIXPANEL_TOKEN = '58f4842ea22684a5a216331baa25a213';
  const MIXPANEL_API_HOST = 'https://api-eu.mixpanel.com';
  const body = document.body;
  const pageType = body?.dataset.pageType || 'unknown';
  const slug = body?.dataset.comicSlug || '';
  const person = body?.dataset.person || '';
  const title = body?.dataset.title || document.title || '';
  const sent = new Set();
  const ATTRIBUTION_STORAGE_KEY = 'memento_attribution';
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  function hasPrivacySignal() {
    const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    return window.globalPrivacyControl === true || dnt === '1' || dnt === 'yes';
  }

  function safeUrl(rawUrl) {
    try {
      return new URL(rawUrl, location.href);
    } catch (_error) {
      return null;
    }
  }

  function cleanString(value, max = 120) {
    return String(value || '').trim().slice(0, max);
  }

  function isInternalReferrer(referrerUrl) {
    return referrerUrl && referrerUrl.host === location.host;
  }

  function classifyChannel(source, medium) {
    const src = cleanString(source).toLowerCase();
    const med = cleanString(medium).toLowerCase();
    if (!src && !med) return 'direct';
    if (['cpc', 'ppc', 'paid', 'paid_search', 'sem'].includes(med)) return 'paid_search';
    if (['paid_social', 'social_paid'].includes(med)) return 'paid_social';
    if (['email', 'newsletter'].includes(med) || src.includes('newsletter')) return 'email';
    if (['social', 'organic_social'].includes(med)) return 'organic_social';
    if (['referral', 'partner'].includes(med)) return 'referral';
    if (src.includes('google') || src.includes('bing') || src.includes('duckduckgo')) return med.includes('paid') ? 'paid_search' : 'organic_search';
    if (src.includes('twitter') || src.includes('x.com') || src.includes('facebook') || src.includes('instagram') || src.includes('linkedin') || src.includes('reddit')) return med.includes('paid') ? 'paid_social' : 'organic_social';
    return 'referral';
  }

  function getStoredAttribution() {
    try {
      return JSON.parse(localStorage.getItem(ATTRIBUTION_STORAGE_KEY) || '{}') || {};
    } catch (_error) {
      return {};
    }
  }

  function persistAttribution(data) {
    try {
      localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(data));
    } catch (_error) {
      // Ignore storage failures; events still carry current-page attribution.
    }
  }

  function getAttribution() {
    const params = new URLSearchParams(location.search);
    const current = {
      landing_page: location.pathname,
      landing_hash: location.hash,
    };
    for (const key of UTM_KEYS) {
      const value = cleanString(params.get(key));
      if (value) current[key] = value;
    }

    const referrerUrl = safeUrl(document.referrer);
    if (referrerUrl && !isInternalReferrer(referrerUrl)) {
      current.referrer = referrerUrl.origin + referrerUrl.pathname;
      current.referrer_host = referrerUrl.hostname;
    }

    current.source = current.utm_source || current.referrer_host || 'Direct';
    current.channel = classifyChannel(current.source, current.utm_medium);

    const stored = getStoredAttribution();
    const hasCampaignSignal = UTM_KEYS.some((key) => current[key]) || current.referrer_host;
    const firstTouch = stored.first_touch || (hasCampaignSignal ? {
      ...current,
      first_seen_at: new Date().toISOString(),
    } : null);
    const lastTouch = hasCampaignSignal ? {
      ...current,
      last_seen_at: new Date().toISOString(),
    } : stored.last_touch;

    const merged = { first_touch: firstTouch, last_touch: lastTouch };
    if (hasCampaignSignal || (!stored.first_touch && !stored.last_touch)) persistAttribution(merged);

    const first = firstTouch || {};
    const last = lastTouch || {};
    return {
      ...current,
      first_utm_source: first.utm_source,
      first_utm_medium: first.utm_medium,
      first_utm_campaign: first.utm_campaign,
      first_referrer_host: first.referrer_host,
      first_source: first.source,
      first_channel: first.channel,
      last_utm_source: last.utm_source,
      last_utm_medium: last.utm_medium,
      last_utm_campaign: last.utm_campaign,
      last_referrer_host: last.referrer_host,
      last_source: last.source,
      last_channel: last.channel,
    };
  }

  const attribution = getAttribution();

  function initMixpanel() {
    if (hasPrivacySignal()) return false;
    if (typeof window.mixpanel?.init !== 'function') return false;
    if (window.__mementoMixpanelInitialized) return true;
    window.mixpanel.init(MIXPANEL_TOKEN, {
      api_host: MIXPANEL_API_HOST,
      persistence: 'localStorage',
      debug: false,
      ignore_dnt: false,
      ip: false,
    });
    window.mixpanel.register({
      site: 'memento_mori_obituary_comics',
      page_type: pageType,
      value_moment_event: 'reader_finished',
      ...attribution,
    });
    window.__mementoMixpanelInitialized = true;
    return true;
  }

  function getDistinctId() {
    const key = 'memento_mixpanel_distinct_id';
    try {
      const existing = localStorage.getItem(key);
      if (existing) return existing;
      const generated = crypto?.randomUUID?.() || `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(key, generated);
      return generated;
    } catch (_error) {
      return 'anonymous';
    }
  }

  function base64Json(value) {
    const json = JSON.stringify(value);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }

  function sendMixpanelFallback(name, payload) {
    if (hasPrivacySignal()) return;
    const event = {
      event: name,
      properties: {
        ...payload,
        token: MIXPANEL_TOKEN,
        distinct_id: getDistinctId(),
        $current_url: location.href,
        $pathname: location.pathname,
        mp_lib: 'memento_static_fallback',
        time: Math.floor(Date.now() / 1000),
      },
    };
    const url = `${MIXPANEL_API_HOST}/track/?data=${encodeURIComponent(base64Json(event))}&ip=0`;
    const beacon = new Image();
    beacon.src = url;
  }

  function cleanData(data = {}) {
    const out = { page_type: pageType, ...attribution };
    if (slug) out.slug = slug;
    if (person) out.person = person;
    if (title) out.title = title;
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null || value === '') continue;
      if (typeof value === 'number' || typeof value === 'boolean') out[key] = value;
      else out[key] = cleanString(value);
    }
    return out;
  }

  function track(name, data = {}, onceKey = '') {
    const key = onceKey || '';
    if (key) {
      if (sent.has(key)) return;
      sent.add(key);
    }
    const payload = cleanData(data);
    window.__mementoLastEvent = { name, data: payload, at: new Date().toISOString() };
    if (typeof window.va === 'function') {
      window.va('event', { name, data: payload });
    }
    if (initMixpanel() && typeof window.mixpanel?.track === 'function') {
      window.mixpanel.track(name, payload);
    } else {
      sendMixpanelFallback(name, payload);
    }
  }

  window.mementoTrack = track;

  track('memento_page_loaded', { path: location.pathname, hash: location.hash }, 'page_loaded');

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a,button');
    if (!link) return;
    const label = (link.textContent || link.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 80);
    const href = link.getAttribute('href') || '';
    const onclick = link.getAttribute('onclick') || '';
    const url = safeUrl(href);
    const clickData = { label, href };

    if (link.classList.contains('support-open-btn') || onclick.includes('openSupportModal')) {
      track('support_modal_opened', { label }, 'support_modal_opened');
      return;
    }
    if (onclick.includes('copySupportAddress') || onclick.includes('copyPdfSupportAddress')) {
      track('support_address_copied', { label, surface: onclick.includes('Pdf') ? 'pdf_modal' : 'support_modal' });
      return;
    }
    if (href.startsWith('mailto:') || href.startsWith('sms:') || href.includes('wa.me') || href.includes('whatsapp') || href.includes('twitter.com/intent') || href.includes('x.com/intent') || href.includes('telegram.me/share')) {
      track('share_clicked', clickData);
      return;
    }
    if (href.includes('newsletter') || label.toLowerCase().includes('newsletter') || label.toLowerCase().includes('subscribe')) {
      track('newsletter_clicked', clickData);
      return;
    }
    if (url && url.host && url.host !== location.host) {
      track('outbound_link_clicked', { ...clickData, outbound_host: url.hostname });
      return;
    }
    if (link.id === 'fullscreenBtn') {
      track('reader_fullscreen_clicked', { label }, 'fullscreen_clicked');
      return;
    }
    if (href.includes('#read')) track('comic_read_clicked', clickData);
    else if (href.toLowerCase().endsWith('.pdf')) track('comic_pdf_clicked', clickData);
    else if (href.includes('contact-sheet')) track('comic_contact_sheet_clicked', clickData);
    else if (href === '/' || href === '/#archive') track('navigation_clicked', clickData);
  }, { passive: true });

  document.addEventListener('fullscreenchange', () => {
    track(document.fullscreenElement ? 'reader_fullscreen_entered' : 'reader_fullscreen_exited');
  });

  const timeBuckets = [15, 30, 60, 120, 300];
  for (const seconds of timeBuckets) {
    window.setTimeout(() => track('time_on_page_bucket', { seconds }, `time_${seconds}`), seconds * 1000);
  }

  if (pageType === 'archive') {
    const cards = document.querySelectorAll('.archive-card').length;
    track('archive_viewed', { cards }, 'archive_viewed');
  }

  if (pageType === 'reader') {
    const pages = Array.from(document.querySelectorAll('.reader-page'));
    track('reader_opened', { pages: pages.length }, 'reader_opened');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.55) continue;
          const index = pages.indexOf(entry.target) + 1;
          if (index < 1) continue;
          track('reader_page_seen', { page: index, total_pages: pages.length }, `page_seen_${index}`);
          if (index === pages.length) track('reader_finished', { total_pages: pages.length }, 'reader_finished');
        }
      }, { threshold: [0.55] });
      pages.forEach((page) => observer.observe(page));
    }

    const milestones = [25, 50, 75, 100];
    const onScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.round((window.scrollY / max) * 100));
      for (const milestone of milestones) {
        if (pct >= milestone) track('reader_scroll_depth', { percent: milestone }, `scroll_${milestone}`);
      }
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
