import React, { useEffect, useRef, useState } from 'react';
import { amap, HBUI } from '@huoban/page-client-toolkit';

const { getAMapLoader } = amap;
const { Loading, Icon } = HBUI;

export default function LocationWidget(props) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);

  // Use props directly or default values
  const zoomLevel = props.custom_setting?.zoom_level || 15;
  const themeMode = props.env?.theme_mode || 'light';

  // Initialization Effect
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        const AMapLoader = await getAMapLoader();
        const AMap = await AMapLoader.load();

        if (!isMounted || !mapContainer.current) return;

        // Initialize Map
        const map = new AMap.Map(mapContainer.current, {
          zoom: zoomLevel,
          resizeEnable: true,
        });

        mapInstance.current = map;

        // Set initial map style
        const initialStyle = themeMode === 'dark' ? 'amap://styles/dark' : 'amap://styles/normal';
        map.setMapStyle(initialStyle);

        // Load Geolocation Plugin
        map.plugin('AMap.Geolocation', function () {
          const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            buttonPosition: 'RB',
            buttonOffset: new AMap.Pixel(10, 20),
            zoomToAccuracy: true,
          });

          map.addControl(geolocation);

          // Start locating immediately
          geolocation.getCurrentPosition(function (status, result) {
            if (!isMounted) return;
            setLoading(false);

            if (status === 'complete') {
              onComplete(result);
            } else {
              onError(result);
            }
          });
        });

      } catch (err) {
        console.error("Failed to load map:", err);
        if (isMounted) {
          setLoading(false);
          setError("地图组件加载失败");
        }
      }
    };

    const onComplete = (data) => {
      console.log('Location success:', data);
      setLocationInfo({
        address: data.formattedAddress,
        position: [data.position.lng, data.position.lat]
      });
    };

    const onError = (data) => {
      console.error('Location error:', data);
      setError("定位失败：" + (data.message || "未知错误"));
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
    // Removed themeMode from dependency array to prevent re-init
  }, [zoomLevel]);

  // Theme Update Effect
  useEffect(() => {
    if (mapInstance.current) {
       const mapStyle = themeMode === 'dark' ? 'amap://styles/dark' : 'amap://styles/normal';
       mapInstance.current.setMapStyle(mapStyle);
    }
  }, [themeMode]);

  return (
    <div className="location-widget-container">
      {loading && (
        <div className="loading-overlay">
          <Loading size="default" />
          <span className="loading-text">正在定位...</span>
        </div>
      )}

      {error && (
        <div className="error-message">
           <Icon type="warning" fontSource="hbicon" color="var(--custom-error)" />
           <span>{error}</span>
        </div>
      )}

      {locationInfo && (
        <div className="location-info-bar">
          <Icon type="location" fontSource="hbicon" />
          <span className="address-text">{locationInfo.address}</span>
        </div>
      )}

      <div ref={mapContainer} className="amap-container" />
    </div>
  );
}
