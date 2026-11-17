import React, {useState, useEffect} from 'react';
import {Image, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';

const CANDIDATE_EXTENSIONS = [
  'favicon.ico',
  'icon.png',
  'favicon.png',
  'icon.ico',
];

export const ModuleIcon = ({appId, isShortcut}) => {
  const [iconUri, setIconUri] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const findLocalIcon = async () => {
      if (isShortcut || !appId) return;

      const codeDir = `${RNFS.DocumentDirectoryPath}/apps/${appId}/code`;

      for (const file of CANDIDATE_EXTENSIONS) {
        const path = `${codeDir}/${file}`;
        if (await RNFS.exists(path)) {
          if (isMounted) {
            // Adicionamos timestamp no final pra ignorar cache se o app for reinstalado
            setIconUri(`file://${path}?t=${Date.now()}`);
          }
          return;
        }
      }
    };

    findLocalIcon();

    return () => {
      isMounted = false;
    };
  }, [appId, isShortcut]);

  const defaultIconName = isShortcut ? 'globe-outline' : 'cube-outline';

  if (iconUri && !hasError) {
    return (
      <Image
        source={{uri: iconUri}}
        style={{width: 22, height: 22, resizeMode: 'contain'}}
        onError={() => setHasError(true)}
      />
    );
  }

  return <Icon name={defaultIconName} size={22} color="#7C4DFF" />;
};
