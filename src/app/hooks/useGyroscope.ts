import { useState, useEffect, useCallback } from 'react';

interface GyroscopeData {
  x: number; // -1 to 1 (left to right tilt)
  y: number; // -1 to 1 (forward to back tilt)
  isSupported: boolean;
  needsPermission: boolean;
  requestPermission: () => Promise<void>;
}

/**
 * useGyroscope - Hook to access device orientation/gyroscope data
 * 
 * Maps device tilt to normalized x/y values (-1 to 1)
 * Includes permission handling for iOS 13+
 * 
 * @returns {GyroscopeData} Normalized tilt data and support status
 */
export function useGyroscope(): GyroscopeData {
  const [data, setData] = useState<{
    x: number;
    y: number;
    isSupported: boolean;
    needsPermission: boolean;
  }>({
    x: 0,
    y: 0,
    isSupported: false,
    needsPermission: false,
  });

  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = useCallback(async () => {
    // Check if DeviceOrientationEvent is supported
    if (!window.DeviceOrientationEvent) {
      console.log('DeviceOrientationEvent not supported');
      return;
    }

    // iOS 13+ requires explicit permission
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          setData((prev) => ({ ...prev, isSupported: true, needsPermission: false }));
        } else {
          setData((prev) => ({ ...prev, needsPermission: true }));
        }
      } catch (error) {
        console.log('Device orientation permission denied', error);
        setData((prev) => ({ ...prev, needsPermission: true }));
      }
    } else {
      // Non-iOS or older iOS - assume permission granted
      setPermissionGranted(true);
      setData((prev) => ({ ...prev, isSupported: true, needsPermission: false }));
    }
  }, []);

  useEffect(() => {
    // Check if DeviceOrientationEvent is supported
    if (!window.DeviceOrientationEvent) {
      console.log('DeviceOrientationEvent not supported');
      return;
    }

    // Check if we need permission (iOS 13+)
    const needsPermission = typeof (DeviceOrientationEvent as any).requestPermission === 'function';
    
    if (needsPermission) {
      setData((prev) => ({ ...prev, needsPermission: true }));
    } else {
      // Auto-request for non-iOS
      requestPermission();
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (!permissionGranted) return;

      // Get gamma (left-right tilt) and beta (front-back tilt)
      const gamma = event.gamma || 0; // -90 to 90 degrees
      const beta = event.beta || 0;   // -180 to 180 degrees

      // Normalize to -1 to 1 range
      // Gamma: -45 to 45 degrees maps to -1 to 1
      const normalizedX = Math.max(-1, Math.min(1, gamma / 45));
      
      // Beta: -45 to 45 degrees maps to -1 to 1
      // Adjust for device orientation (portrait mode)
      const normalizedY = Math.max(-1, Math.min(1, (beta - 45) / 45));

      setData((prev) => ({
        ...prev,
        x: normalizedX,
        y: normalizedY,
        isSupported: true,
      }));
    };

    // Add event listener
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionGranted, requestPermission]);

  return {
    ...data,
    requestPermission,
  };
}

/**
 * Map gyroscope data to CSS gradient angle
 * 
 * @param x Normalized x tilt (-1 to 1)
 * @param y Normalized y tilt (-1 to 1)
 * @returns CSS gradient angle in degrees (0-360)
 */
export function mapTiltToGradientAngle(x: number, y: number): number {
  // Convert x/y to angle
  // x: -1 (left) to 1 (right)
  // y: -1 (top) to 1 (bottom)
  
  const baseAngle = 135; // Default angle (bottom-right)
  const tiltInfluence = 30; // How much tilt affects angle (in degrees)
  
  const angle = baseAngle + (x * tiltInfluence) - (y * tiltInfluence);
  
  return angle;
}

/**
 * Map gyroscope data to gradient position offset
 * 
 * @param x Normalized x tilt (-1 to 1)
 * @param y Normalized y tilt (-1 to 1)
 * @returns Object with translateX and translateY percentages
 */
export function mapTiltToGradientPosition(x: number, y: number) {
  const maxOffset = 20; // Maximum offset in percentage
  
  return {
    translateX: x * maxOffset,
    translateY: y * maxOffset,
  };
}
