import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  Animated,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Video, AVPlaybackSource } from 'expo-av';
import { initDatabase, getMessages, saveMessage } from '../services/database';
import { initPusher, bindMessageEvent, unbindMessageEvent, disconnectPusher } from '../services/pusherService';
import { pusherConfig } from '../config/pusherConfig';
import * as DocumentPicker from 'expo-document-picker';
import { Message, MessageType, MessageSender } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_IMAGE_WIDTH = SCREEN_WIDTH * 0.6;

const ChattingScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const flatListRef = useRef<FlatList<Message> | null>(null);
  const videoRefs = useRef<{ [key: string]: Video }>({});
  const typingAnimations = useRef<Animated.Value[]>([
    new Animated.Value(0.4),
    new Animated.Value(0.4),
    new Animated.Value(0.4),
  ]).current;
  const typingAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleReceivedMessage = async (data: Partial<Message>): Promise<void> => {
    try {
      console.log('📬 Processing received message:', data);
      
      const newMessage: Message = {
        id: data.id || Date.now().toString(),
        type: (data.type || 'text') as MessageType,
        text: data.text || null,
        uri: data.uri || null,
        width: data.width || null,
        height: data.height || null,
        fileName: data.fileName || null,
        fileSize: data.fileSize || null,
        title: data.title || null,
        items: data.items || null,
        sender: (data.sender || 'other') as MessageSender,
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      await saveMessage(newMessage);
      console.log('💾 Message saved to SQLite');

      setMessages((prev) => [...prev, newMessage]);
      console.log('✅ Message added to UI');
    } catch (error) {
      console.error('❌ Error handling received message:', error);
    }
  };

  const addMessageToDB = async (message: Message): Promise<void> => {
    try {
      await saveMessage(message);
      setMessages((prev) => [...prev, message]);
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  };

  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      try {
        await initDatabase();
        
        const savedMessages = await getMessages();
        if (savedMessages.length > 0) {
          setMessages(savedMessages);
        } else {
          const welcomeMessage: Message = {
            id: '1',
            type: 'text',
            text: 'Hello! How can I help you today?',
            sender: 'other',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          await saveMessage(welcomeMessage);
          setMessages([welcomeMessage]);
        }
        
        const pusherInit = initPusher(pusherConfig);
        if (pusherInit) {
          bindMessageEvent(pusherConfig.eventName, handleReceivedMessage);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();

    return () => {
      unbindMessageEvent(pusherConfig.eventName);
      disconnectPusher();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions!');
      }
    })();
  }, []);

  useEffect(() => {
    if (isTyping) {
      const animations = typingAnimations.map((anim, index) => {
        return Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
        ]);
      });

      const loopAnimation = Animated.loop(Animated.parallel(animations));
      typingAnimationRef.current = loopAnimation;
      loopAnimation.start();
    } else {
      if (typingAnimationRef.current) {
        typingAnimationRef.current.stop();
        typingAnimationRef.current = null;
      }
      typingAnimations.forEach((anim) => {
        anim.setValue(0.4);
      });
    }

    return () => {
      if (typingAnimationRef.current) {
        typingAnimationRef.current.stop();
      }
    };
  }, [isTyping]);

  useEffect(() => {
    if (showAttachmentModal) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [showAttachmentModal]);

  useEffect(() => {
    (async () => {
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryStatus !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }

      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        alert('Sorry, we need camera permissions to take photos!');
      }
    })();
  }, []);
  
  const handleSend = async (): Promise<void> => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      text: inputText.trim(),
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    await addMessageToDB(newMessage);
    setInputText('');

    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'text',
        text: 'Thanks for your message!',
        sender: 'other',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      await addMessageToDB(replyMessage);
    }, 2000);
  };

  const pickImage = async (): Promise<void> => {
    setShowAttachmentModal(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'image',
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
          sender: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        await addMessageToDB(newMessage);
        setIsTyping(true);

        setTimeout(async () => {
          setIsTyping(false);
          const replyMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'text',
            text: 'Nice image!',
            sender: 'other',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          await addMessageToDB(replyMessage);
        }, 2000);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const takePhoto = async (): Promise<void> => {
    setShowAttachmentModal(false);
    
    try {
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
        
        if (newStatus !== 'granted') {
          alert('Camera permissions are required to take photos. Please enable them in your device settings.');
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'image',
          uri: asset.uri,
          width: asset.width || 300,
          height: asset.height || 400,
          sender: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        await addMessageToDB(newMessage);
        
        setIsTyping(true);
        setTimeout(async () => {
          setIsTyping(false);
          const replyMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'text',
            text: 'Nice photo!',
            sender: 'other',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          await addMessageToDB(replyMessage);
        }, 2000);
      } else if (result.canceled) {
        console.log('User cancelled camera');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Failed to take photo. Please try again.');
    }
  };

  const pickVideo = async (): Promise<void> => {
    setShowAttachmentModal(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'video',
          uri: result.assets[0].uri,
          width: result.assets[0].width || 300,
          height: result.assets[0].height || 200,
          sender: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        await addMessageToDB(newMessage);
        setIsTyping(true);

        setTimeout(async () => {
          setIsTyping(false);
          const replyMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'text',
            text: 'Great video!',
            sender: 'other',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          await addMessageToDB(replyMessage);
        }, 2000);
      }
    } catch (error) {
      console.error('Error picking video:', error);
    }
  };

  const attachFile = async (): Promise<void> => {
    setShowAttachmentModal(false);
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log('Document picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        const formatFileSize = (bytes: number): string => {
          if (bytes < 1024) return bytes + ' B';
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
          return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        };

        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'file',
          uri: asset.uri,
          fileName: asset.name || 'document.pdf',
          fileSize: formatFileSize(asset.size || 0),
          sender: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        await addMessageToDB(newMessage);
        
        setIsTyping(true);
        setTimeout(async () => {
          setIsTyping(false);
          const replyMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'text',
            text: `I've received your file: ${asset.name}`,
            sender: 'other',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          await addMessageToDB(replyMessage);
        }, 2000);
      } else if (result.canceled) {
        console.log('User cancelled file picker');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      alert('Failed to attach file. Please try again.');
    }
  };

  const selectCatalog = async (): Promise<void> => {
    setShowAttachmentModal(false);
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'catalog',
        title: 'Product Catalog',
        items: 25,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      await addMessageToDB(newMessage);
      
      setIsTyping(true);
      setTimeout(async () => {
        setIsTyping(false);
        const replyMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'text',
          text: 'Great! I\'ve received your catalog selection.',
          sender: 'other',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        await addMessageToDB(replyMessage);
      }, 2000);
    } catch (error) {
      console.error('Error selecting catalog:', error);
      alert('Failed to select catalog. Please try again.');
    }
  };

  const pickGIF = async (): Promise<void> => {
    setShowAttachmentModal(false);
    const sampleGIFs = [
      'https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif',
      'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif',
      'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    ];

    const randomGIF = sampleGIFs[Math.floor(Math.random() * sampleGIFs.length)];

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'gif',
      uri: randomGIF,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    await addMessageToDB(newMessage);
    setIsTyping(true);

    setTimeout(async () => {
      setIsTyping(false);
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'text',
        text: 'Haha, nice GIF!',
        sender: 'other',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      await addMessageToDB(replyMessage);
    }, 2000);
  };

  const renderTextMessage = (item: Message, isMe: boolean): JSX.Element => {
    return (
      <View style={[styles.messageBubble, isMe ? styles.messageBubbleRight : styles.messageBubbleLeft]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
    );
  };

  const renderImageMessage = (item: Message, isMe: boolean): JSX.Element => {
    const aspectRatio = (item.width || 1) / (item.height || 1);
    const imageWidth = Math.min(MAX_IMAGE_WIDTH, item.width || 300);
    const imageHeight = imageWidth / aspectRatio;

    return (
      <View style={[styles.messageBubble, isMe ? styles.messageBubbleRight : styles.messageBubbleLeft, styles.mediaBubble]}>
        <Image
          source={{ uri: item.uri || '' }}
          style={[
            styles.mediaImage,
            { width: imageWidth, height: imageHeight },
            isMe ? styles.mediaImageRight : styles.mediaImageLeft,
          ]}
          resizeMode="cover"
        />
        <Text style={[styles.timestamp, styles.mediaTimestamp]}>{item.timestamp}</Text>
      </View>
    );
  };

  const renderVideoMessage = (item: Message, isMe: boolean): JSX.Element => {
    const aspectRatio = (item.width || 1) / (item.height || 1);
    const videoWidth = Math.min(MAX_IMAGE_WIDTH, item.width || 300);
    const videoHeight = videoWidth / aspectRatio;

    return (
      <View style={[styles.messageBubble, isMe ? styles.messageBubbleRight : styles.messageBubbleLeft, styles.mediaBubble]}>
        <Video
          ref={(ref) => {
            if (ref && item.id) {
              videoRefs.current[item.id] = ref;
            }
          }}
          source={{ uri: item.uri || '' } as AVPlaybackSource}
          style={[
            styles.mediaVideo,
            { width: videoWidth, height: videoHeight },
            isMe ? styles.mediaVideoRight : styles.mediaVideoLeft,
          ]}
          useNativeControls
          resizeMode={Video.ResizeMode.CONTAIN}
          isLooping
        />
        <Text style={[styles.timestamp, styles.mediaTimestamp]}>{item.timestamp}</Text>
      </View>
    );
  };

  const renderGIFMessage = (item: Message, isMe: boolean): JSX.Element => {
    return (
      <View style={[styles.messageBubble, isMe ? styles.messageBubbleRight : styles.messageBubbleLeft, styles.mediaBubble]}>
        <Image
          source={{ uri: item.uri || '' }}
          style={[styles.gifImage, isMe ? styles.gifImageRight : styles.gifImageLeft]}
          resizeMode="contain"
        />
        <Text style={[styles.timestamp, styles.mediaTimestamp]}>{item.timestamp}</Text>
      </View>
    );
  };

  const renderFileMessage = (item: Message, isMe: boolean): JSX.Element => {
    return (
      <View style={[styles.messageBubble, isMe ? styles.messageBubbleRight : styles.messageBubbleLeft, styles.fileBubble]}>
        <View style={styles.fileContent}>
          <Text style={styles.fileIcon}>📄</Text>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>{item.fileName}</Text>
            <Text style={styles.fileSize}>{item.fileSize}</Text>
          </View>
        </View>
        <Text style={[styles.timestamp, styles.mediaTimestamp]}>{item.timestamp}</Text>
      </View>
    );
  };

  const renderCatalogMessage = (item: Message, isMe: boolean): JSX.Element => {
    return (
      <View style={[styles.messageBubble, isMe ? styles.messageBubbleRight : styles.messageBubbleLeft, styles.catalogBubble]}>
        <View style={styles.catalogContent}>
          <Text style={styles.catalogIcon}>📦</Text>
          <View style={styles.catalogInfo}>
            <Text style={styles.catalogTitle}>{item.title}</Text>
            <Text style={styles.catalogItems}>{item.items} items</Text>
          </View>
        </View>
        <Text style={[styles.timestamp, styles.mediaTimestamp]}>{item.timestamp}</Text>
      </View>
    );
  };

  const renderMessage: ListRenderItem<Message> = ({ item }) => {
    const isMe = item.sender === 'me';
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.messageContainerRight : styles.messageContainerLeft,
        ]}
      >
        {item.type === 'text' && renderTextMessage(item, isMe)}
        {item.type === 'image' && renderImageMessage(item, isMe)}
        {item.type === 'video' && renderVideoMessage(item, isMe)}
        {item.type === 'gif' && renderGIFMessage(item, isMe)}
        {item.type === 'file' && renderFileMessage(item, isMe)}
        {item.type === 'catalog' && renderCatalogMessage(item, isMe)}
      </View>
    );
  };

  const renderTypingIndicator = (): JSX.Element | null => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.messageContainerLeft]} testID="typing-indicator">
        <View style={[styles.messageBubble, styles.messageBubbleLeft, styles.typingBubble]}>
          <View style={styles.typingDots}>
            {typingAnimations.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.typingDot,
                  {
                    opacity: anim,
                    transform: [
                      {
                        scale: anim.interpolate({
                          inputRange: [0.4, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="chat-screen">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <View style={styles.headerProfile}>
            <Image
              source={{ uri: 'https://static.vecteezy.com/system/resources/previews/032/176/191/non_2x/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg' }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <View style={styles.profileRow}>
                <Text style={styles.profileName}>logitech.Store</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedIcon}>✓</Text>
                </View>
              </View>
              <View style={styles.profileRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
                <View style={{width: 10}} />
                <TouchableOpacity style={styles.subscribersButton}>
                  <Text style={styles.subscribersText}>2K Subscribers</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity style={styles.infoButton}>
              <Text style={styles.infoIcon}>i</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderTypingIndicator}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity
            testID="attach-button"
            style={styles.attachButton}
            onPress={() => setShowAttachmentModal(true)}
          >
            <Text style={styles.attachButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.emojiButton} onPress={pickGIF}>
            <Text style={styles.emojiButtonText}>GIF</Text>
          </TouchableOpacity>
          <TextInput
            testID="message-input"
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            testID="send-button"
            style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={inputText.trim() === ''}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>

        {showAttachmentModal && (
          <View style={styles.popupOverlay}>
            <TouchableOpacity
              style={styles.popupBackdrop}
              activeOpacity={1}
              onPress={() => setShowAttachmentModal(false)}
            />
            <Animated.View
              style={[
                styles.popupDialog,
                {
                  transform: [{ translateY: modalTranslateY }],
                },
              ]}
            >
              <View style={styles.popupHandle} />
              <TouchableOpacity style={styles.popupOption} onPress={takePhoto}>
                <View style={styles.popupOptionIcon}>
                  <Text style={styles.popupIconText}>📷</Text>
                </View>
                <Text style={styles.popupOptionText}>Take Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popupOption} onPress={pickImage}>
                <View style={styles.popupOptionIcon}>
                  <Text style={styles.popupIconText}>🖼️</Text>
                </View>
                <Text style={styles.popupOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popupOption} onPress={attachFile}>
                <View style={styles.popupOptionIcon}>
                  <Text style={styles.popupIconText}>📎</Text>
                </View>
                <Text style={styles.popupOptionText}>Attach File</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popupOption} onPress={selectCatalog}>
                <View style={styles.popupOptionIcon}>
                  <Text style={styles.popupIconText}>📦</Text>
                </View>
                <Text style={styles.popupOptionText}>Select Catalog</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalBars: {
    width: 20,
    height: 12,
    backgroundColor: '#000',
    marginRight: 5,
  },
  battery: {
    width: 30,
    height: 15,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 6,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  verifiedIcon: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  subscribersButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  subscribersText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  infoButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 15,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '75%',
  },
  messageContainerLeft: {
    alignSelf: 'flex-start',
  },
  messageContainerRight: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageBubbleLeft: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: '#E5E5EA',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'flex-end',
  },
  mediaBubble: {
    padding: 0,
    overflow: 'hidden',
  },
  mediaImage: {
    borderRadius: 18,
  },
  mediaImageLeft: {
    borderBottomLeftRadius: 4,
  },
  mediaImageRight: {
    borderBottomRightRadius: 4,
  },
  mediaVideo: {
    borderRadius: 18,
  },
  mediaVideoLeft: {
    borderBottomLeftRadius: 4,
  },
  mediaVideoRight: {
    borderBottomRightRadius: 4,
  },
  gifImage: {
    width: 200,
    height: 200,
    borderRadius: 18,
  },
  gifImageLeft: {
    borderBottomLeftRadius: 4,
  },
  gifImageRight: {
    borderBottomRightRadius: 4,
  },
  mediaTimestamp: {
    padding: 8,
    paddingTop: 4,
  },
  fileBubble: {
    padding: 12,
  },
  fileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fileIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  catalogBubble: {
    padding: 12,
  },
  catalogContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  catalogIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  catalogInfo: {
    flex: 1,
  },
  catalogTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  catalogItems: {
    fontSize: 12,
    color: '#666',
  },
  typingBubble: {
    padding: 12,
    minWidth: 50,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  emojiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  emojiButtonText: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendIcon: {
    fontSize: 18,
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  popupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popupDialog: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  popupHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d0d0d0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  popupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  popupOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  popupIconText: {
    fontSize: 22,
  },
  popupOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default ChattingScreen;

