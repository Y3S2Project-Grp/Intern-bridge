import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { AIService } from '../../services/aiService';
import { Colors } from '../../constants/Colors';

interface CareerTip {
  id: string;
  title: string;
  category: string;
  content: string;
  readTime: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  source?: string;
  url?: string;
  isBookmarked: boolean;
}

interface VideoResource {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  url: string;
  category: string;
}

interface Props {
  navigation: any;
}

const CareerTipsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [tips, setTips] = useState<CareerTip[]>([]);
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedTips, setBookmarkedTips] = useState<string[]>([]);

  const categories = [
    'all',
    'interview',
    'resume',
    'skills',
    'career-growth',
    'networking',
    'productivity',
  ];

  useEffect(() => {
    loadCareerTips();
    loadVideoResources();
  }, []);

  const loadCareerTips = async () => {
    // Simulate loading career tips
    const mockTips: CareerTip[] = [
      {
        id: '1',
        title: 'How to Write a Standout Resume for Tech Internships',
        category: 'resume',
        content: 'Learn the key elements that make your resume stand out to tech companies. Focus on projects, relevant skills, and measurable achievements.',
        readTime: '5 min read',
        level: 'beginner',
        tags: ['Resume', 'Tech', 'Applications'],
        source: 'Career Center',
        url: 'https://example.com/resume-tips',
        isBookmarked: false,
      },
      {
        id: '2',
        title: 'Ace Your Technical Interview: Common Questions and Strategies',
        category: 'interview',
        content: 'Prepare for technical interviews with these common questions and problem-solving strategies. Practice whiteboarding and system design.',
        readTime: '8 min read',
        level: 'intermediate',
        tags: ['Interview', 'Technical', 'Preparation'],
        source: 'Tech Interviews Guide',
        url: 'https://example.com/technical-interview',
        isBookmarked: false,
      },
      {
        id: '3',
        title: 'Building a Professional Network as a Student',
        category: 'networking',
        content: 'Effective strategies for building professional connections while still in university. Leverage LinkedIn, university events, and online communities.',
        readTime: '6 min read',
        level: 'beginner',
        tags: ['Networking', 'LinkedIn', 'Career'],
        source: 'Professional Development',
        url: 'https://example.com/student-networking',
        isBookmarked: false,
      },
      {
        id: '4',
        title: 'Top 5 In-Demand Skills for 2024',
        category: 'skills',
        content: 'Discover the most sought-after skills in the current job market and how to develop them through online courses and projects.',
        readTime: '7 min read',
        level: 'beginner',
        tags: ['Skills', 'Trending', 'Learning'],
        source: 'Industry Report',
        url: 'https://example.com/in-demand-skills',
        isBookmarked: false,
      },
    ];
    setTips(mockTips);
  };

  const loadVideoResources = async () => {
    // Simulate loading video resources
    const mockVideos: VideoResource[] = [
      {
        id: '1',
        title: 'React Native Crash Course for Beginners',
        channel: 'Programming with Mosh',
        duration: '2:15:30',
        thumbnail: 'react-native-thumb',
        url: 'https://youtube.com/watch?v=0-S5a0eXPoc',
        category: 'skills',
      },
      {
        id: '2',
        title: 'How to Negotiate Your First Job Offer',
        channel: 'Career Contessa',
        duration: '15:45',
        thumbnail: 'negotiation-thumb',
        url: 'https://youtube.com/watch?v=negotiation-tips',
        category: 'career-growth',
      },
      {
        id: '3',
        title: 'Building a Portfolio That Gets You Hired',
        channel: 'DesignCourse',
        duration: '22:30',
        thumbnail: 'portfolio-thumb',
        url: 'https://youtube.com/watch?v=portfolio-tips',
        category: 'resume',
      },
    ];
    setVideos(mockVideos);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCareerTips();
    await loadVideoResources();
    setRefreshing(false);
  };

  const handleBookmark = (tipId: string) => {
    setBookmarkedTips(prev => {
      const newBookmarks = prev.includes(tipId)
        ? prev.filter(id => id !== tipId)
        : [...prev, tipId];
      
      // Update the tips array to reflect bookmark changes
      setTips(prevTips => 
        prevTips.map(tip => 
          tip.id === tipId 
            ? { ...tip, isBookmarked: !tip.isBookmarked }
            : tip
        )
      );
      
      return newBookmarks;
    });
  };

  const handleShare = async (tip: CareerTip) => {
    try {
      await Share.share({
        message: `Check out this career tip: ${tip.title}\n\n${tip.content}\n\nRead more: ${tip.url}`,
        title: tip.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share tip');
    }
  };

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
  };

  const filteredTips = selectedCategory === 'all' 
    ? tips 
    : tips.filter(tip => tip.category === selectedCategory);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return Colors.success;
      case 'intermediate': return Colors.warning;
      case 'advanced': return Colors.error;
      default: return Colors.gray;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'interview': return 'chatbubbles';
      case 'resume': return 'document-text';
      case 'skills': return 'build';
      case 'career-growth': return 'trending-up';
      case 'networking': return 'people';
      case 'productivity': return 'time';
      default: return 'bulb';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Career Tips Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Career Tips & Articles</Text>
          </View>

          {filteredTips.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <View style={styles.tipMeta}>
                  <View style={styles.categoryTag}>
                    <Ionicons 
                      name={getCategoryIcon(tip.category) as any} 
                      size={14} 
                      color={Colors.primary} 
                    />
                    <Text style={styles.categoryTagText}>
                      {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
                    </Text>
                  </View>
                  <View style={[styles.levelBadge, { backgroundColor: getLevelColor(tip.level) }]}>
                    <Text style={styles.levelText}>{tip.level}</Text>
                  </View>
                </View>
                
                <View style={styles.tipActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleBookmark(tip.id)}
                  >
                    <Ionicons 
                      name={tip.isBookmarked ? "bookmark" : "bookmark-outline"} 
                      size={20} 
                      color={tip.isBookmarked ? Colors.primary : Colors.gray} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleShare(tip)}
                  >
                    <Ionicons name="share-social" size={20} color={Colors.gray} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipContent} numberOfLines={3}>
                {tip.content}
              </Text>

              <View style={styles.tipFooter}>
                <View style={styles.tipInfo}>
                  <Text style={styles.readTime}>{tip.readTime}</Text>
                  {tip.source && (
                    <Text style={styles.source}>• {tip.source}</Text>
                  )}
                </View>
                
                <TouchableOpacity 
                  style={styles.readMoreButton}
                  onPress={() => tip.url && handleOpenLink(tip.url)}
                >
                  <Text style={styles.readMoreText}>Read More</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.tagsContainer}>
                {tip.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Video Resources Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="play-circle" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Video Learning Resources</Text>
          </View>

          {videos.map((video) => (
            <TouchableOpacity 
              key={video.id}
              style={styles.videoCard}
              onPress={() => handleOpenLink(video.url)}
            >
              <View style={styles.videoThumbnail}>
                <Ionicons name="play-circle" size={48} color={Colors.white} />
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{video.duration}</Text>
                </View>
              </View>
              
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoChannel}>{video.channel}</Text>
                
                <View style={styles.videoMeta}>
                  <View style={styles.videoCategory}>
                    <Ionicons name="pricetag" size={12} color={Colors.gray} />
                    <Text style={styles.videoCategoryText}>{video.category}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Tips Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Quick Career Tips</Text>
          </View>

          <View style={styles.quickTipsGrid}>
            <View style={styles.quickTip}>
              <Ionicons name="create" size={32} color={Colors.primary} />
              <Text style={styles.quickTipTitle}>Customize Your Resume</Text>
              <Text style={styles.quickTipText}>
                Tailor your resume for each application to highlight relevant skills.
              </Text>
            </View>

            <View style={styles.quickTip}>
              <Ionicons name="link" size={32} color={Colors.primary} />
              <Text style={styles.quickTipTitle}>Build Connections</Text>
              <Text style={styles.quickTipText}>
                Network with professionals in your desired industry on LinkedIn.
              </Text>
            </View>

            <View style={styles.quickTip}>
              <Ionicons name="code-slash" size={32} color={Colors.primary} />
              <Text style={styles.quickTipTitle">Practice Coding</Text>
              <Text style={styles.quickTipText}>
                Regular coding practice improves problem-solving skills for interviews.
              </Text>
            </View>

            <View style={styles.quickTip}>
              <Ionicons name="school" size={32} color={Colors.primary} />
              <Text style={styles.quickTipTitle">Continuous Learning</Text>
              <Text style={styles.quickTipText}>
                Stay updated with new technologies through online courses and projects.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  categoriesContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: Colors.white,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginLeft: 8,
  },
  tipCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '600',
  },
  tipActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
    lineHeight: 22,
  },
  tipContent: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
    marginBottom: 12,
  },
  tipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTime: {
    fontSize: 12,
    color: Colors.gray,
  },
  source: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 4,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: Colors.dark,
  },
  videoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoThumbnail: {
    height: 120,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '500',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  videoChannel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoCategoryText: {
    fontSize: 11,
    color: Colors.gray,
    marginLeft: 4,
  },
  quickTipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickTip: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickTipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  quickTipText: {
    fontSize: 12,
    color: Colors.dark,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default CareerTipsScreen;