import React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';

/**
 * A drawn graphic of the design (a soft bubble, a blurred shade, a ring): the SVG markup as an image of the given
 * size. Decorative: hidden from assistive technology.
 */
export function Graphic({ svg, width, height, style, testID }: {
  svg: string; width: number; height: number; style?: StyleProp<ImageStyle>; testID?: string;
}) {
  // react-native-web escapes the markup after this prefix itself, so it is passed as it is.
  const uri = `data:image/svg+xml;utf8,${svg}`;
  return (
    <Image
      source={{ uri }} testID={testID} accessible={false} accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height }, style]}
    />
  );
}
