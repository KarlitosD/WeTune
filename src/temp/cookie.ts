export const cookie = "GPS=1; YSC=JaYY85sqAVo; VISITOR_INFO1_LIVE=NP3RyCqgyW0; VISITOR_PRIVACY_METADATA=CgJBUhIEGgAgLg%3D%3D; __Secure-ROLLOUT_TOKEN=CLirq7bJysvebBD_3Lfr7NGRAxiO74Hs7NGRAw%3D%3D; PREF=f6=40000000&tz=America.Argentina%2FBuenos_Aires; __Secure-1PSIDTS=sidts-CjUBflaCdVoP1eL7wWFCvFq18P_f2xQMzpdKvjcEncAdodLcI4-OFW9Vwn1ECvVUybP6_G6VuRAA; __Secure-3PSIDTS=sidts-CjUBflaCdVoP1eL7wWFCvFq18P_f2xQMzpdKvjcEncAdodLcI4-OFW9Vwn1ECvVUybP6_G6VuRAA; HSID=AU0sTFcwFPy0Sj39n; SSID=ADud0FjZkaTcqO1cT; APISID=uFJ34n4SxHBREaIT/AaYSGeaHmGsRS5VpV; SAPISID=Us3hQJl9txvobF3W/ABta61wH0EPt7POoX; __Secure-1PAPISID=Us3hQJl9txvobF3W/ABta61wH0EPt7POoX; __Secure-3PAPISID=Us3hQJl9txvobF3W/ABta61wH0EPt7POoX; SID=g.a0004ghBBrwKrLhB07EfD5RkltglcQiWuqp-nym_myW-zITJ9hEkWUce1vGkYhkbkhcMJtM5kgACgYKAd4SARMSFQHGX2Mi6WfBB0CQK8uSOgaHfVOasBoVAUF8yKqbgoQQAzLz5XeXxYvUdYob0076; __Secure-1PSID=g.a0004ghBBrwKrLhB07EfD5RkltglcQiWuqp-nym_myW-zITJ9hEk2uyUrQMm9rBJaVfs8W9hnAACgYKAWQSARMSFQHGX2MioOu2hVmtnHxSaRanzMf43BoVAUF8yKrNMeWBLSowX6xlc4hpn9ju0076; __Secure-3PSID=g.a0004ghBBrwKrLhB07EfD5RkltglcQiWuqp-nym_myW-zITJ9hEkgyH5Ez66y_YUa3P-nrvQMAACgYKAXkSARMSFQHGX2MiEOV2gYD5dauhCsol_GAUORoVAUF8yKpBJOdBTVVyWdT5ubDMlF760076; LOGIN_INFO=AFmmF2swRQIhAP-5ILWWcz_jB6xSAYKyhuigaDubk33VdAy3zWxTxG0zAiBKUXq5m2kvs5PsC0ct74OZ3ihUHtrm8sldYhn7nKmdcQ:QUQ3MjNmeC0wd2ptWloybXJyNWFJLXdCZG1McURXaFpBUWtOWTJTYWhzYzYzWnl1VTZWVlBJNkFJcEViN2toVTA0WDU3SWEzY0ZSR2cxLTFKemI2dk1yNnljUWVNY2lZTjN6OGlBWWUyQ2VNenNVeGdIMlBCQU9UcmJENG45TFZGZkZpdXFqczJTWU5hUXprUzV1Skxva2FjX01vcGxPckNR; SIDCC=AKEyXzUQrlekU_diTM1o_mc0FcRyZMgGDHTcQjnWlOis8LwxVubKalOtu73RtZgTYW98mYKOag; __Secure-1PSIDCC=AKEyXzVyqmPuiRhp_lwQkZEaw3kUqgII7NH1rT2Je33NyWEy-VftsH7qw5C99B4uDB46uLSJ; __Secure-3PSIDCC=AKEyXzWfui0i0MWlXei1gCjRCBGpchhKXScEKIq5Q8VDKWy2V1nxYTk7fgwLWDBoXNtQmceZ; ST-3opvp5=session_logininfo=AFmmF2swRQIhAP-5ILWWcz_jB6xSAYKyhuigaDubk33VdAy3zWxTxG0zAiBKUXq5m2kvs5PsC0ct74OZ3ihUHtrm8sldYhn7nKmdcQ%3AQUQ3MjNmeC0wd2ptWloybXJyNWFJLXdCZG1McURXaFpBUWtOWTJTYWhzYzYzWnl1VTZWVlBJNkFJcEViN2toVTA0WDU3SWEzY0ZSR2cxLTFKemI2dk1yNnljUWVNY2lZTjN6OGlBWWUyQ2VNenNVeGdIMlBCQU9UcmJENG45TFZGZkZpdXFqczJTWU5hUXprUzV1Skxva2FjX01vcGxPckNR";

// Parse cookies into the new format expected by ytdl-core
export function specificParseCookiesYT(cookieString: string): Array<{ name: string; value: string; domain: string; path: string }> {
  return cookieString.split(';').map(cookie => {
    const parts = cookie.trim().split('=');
    const name = parts[0];
    const value = parts.slice(1).join('=') || '';
    return {
      name: name.trim(),
      value: value,
      domain: '.youtube.com',
      path: '/',
    };
  });
}

export const cookiesArray = specificParseCookiesYT(cookie);
