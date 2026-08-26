// import React from 'react';
// import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

// export default function AcademyScreen() {
//   const handleCall = () => {
//     // Replace with real phone later
//     Linking.openURL('tel:+910000000000').catch(() => {});
//   };

//   const handleWhatsApp = () => {
//     // Replace with real WhatsApp number later
//     const phone = '+910000000000';
//     const message = encodeURIComponent('Hi, I am interested in your cricket academy.');
//     Linking.openURL(`https://wa.me/${phone}?text=${message}`).catch(() => {});
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.card}>
//         <Text style={styles.academyName}>CrickHero Elite Academy</Text>
//         <Text style={styles.tagline}>Train like a pro. Play like a champion.</Text>

//         <Text style={styles.sectionTitle}>About</Text>
//         <Text style={styles.bodyText}>
//           We focus on real match scenarios, fitness, and mental toughness to prepare young
//           cricketers for league and tournament level.
//         </Text>

//         <Text style={styles.sectionTitle}>Location</Text>
//         <Text style={styles.bodyText}>
//           Hyderabad, Telangana{'\n'}Near Gachibowli Stadium
//         </Text>

//         <Text style={styles.sectionTitle}>Training Highlights</Text>
//         <Text style={styles.bodyText}>
//           • Morning and evening batches{'\n'}
//           • Qualified coaches with match experience{'\n'}
//           • Weekend practice matches with live scoring
//         </Text>
//       </View>

//       <Pressable style={styles.primaryButton} onPress={handleCall}>
//         <Text style={styles.primaryButtonText}>Call Academy</Text>
//       </Pressable>

//       <Pressable style={styles.secondaryButton} onPress={handleWhatsApp}>
//         <Text style={styles.secondaryButtonText}>WhatsApp Enquiry</Text>
//       </Pressable>

//       <Text style={styles.footerText}>
//         This is demo content for the MVP. Later you can load these details from the backend.
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#020617',
//     padding: 20,
//   },
//   card: {
//     backgroundColor: '#0F172A',
//     borderRadius: 20,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#1E293B',
//     marginBottom: 20,
//   },
//   academyName: {
//     color: '#FFFFFF',
//     fontSize: 24,
//     fontWeight: '800',
//     marginBottom: 6,
//   },
//   tagline: {
//     color: '#38BDF8',
//     fontSize: 14,
//     marginBottom: 18,
//   },
//   sectionTitle: {
//     color: '#E5E7EB',
//     fontSize: 16,
//     fontWeight: '700',
//     marginTop: 14,
//     marginBottom: 6,
//   },
//   bodyText: {
//     color: '#CBD5E1',
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   primaryButton: {
//     backgroundColor: '#16A34A',
//     borderRadius: 16,
//     paddingVertical: 14,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   primaryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '800',
//   },
//   secondaryButton: {
//     backgroundColor: '#1E293B',
//     borderRadius: 16,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   secondaryButtonText: {
//     color: '#E5E7EB',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   footerText: {
//     color: '#64748B',
//     fontSize: 12,
//     marginTop: 14,
//     textAlign: 'center',
//   },
// });

import React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card } from 'react-native-paper';

export default function AcademyScreen() {
  const handleCall = () => {
    Linking.openURL('tel:+910000000000').catch(() => {});
  };

  const handleWhatsApp = () => {
    const phone = '+910000000000';
    const message = encodeURIComponent(
      'Hi, I am interested in your cricket academy.'
    );
    Linking.openURL(`https://wa.me/${phone}?text=${message}`).catch(() => {});
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>CrickHero Elite Academy</Text>
        <Text style={styles.subtitle}>
          Train like a pro. Play like a champion.
        </Text>
      </View>

      <Card style={styles.heroCard}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1540747737956-37872404797a?w=800',
          }}
          style={styles.image}
        />
        <Badge style={styles.badge}>FEATURED</Badge>

        <Card.Content>
          <Text style={styles.courseTitle}>Batting Masterclass</Text>
          <Text style={styles.body}>
            Learn batting techniques, match awareness, fitness, and game
            strategy with experienced cricket coaches.
          </Text>

          <View style={styles.coachCard}>
            <Text style={styles.coachTitle}>Coach</Text>
            <Text style={styles.body}>
              Certified Cricket Coach (Replace with backend data)
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>About Academy</Text>
          <Text style={styles.body}>
            We focus on real match scenarios, fitness, and mental toughness to
            prepare young cricketers for league and tournament level.
          </Text>

          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.body}>
            Hyderabad, Telangana{"\n"}Near Gachibowli Stadium
          </Text>

          <Text style={styles.sectionTitle}>Training Highlights</Text>
          <Text style={styles.body}>
            • Morning & Evening Batches{"\n"}
            • Qualified Coaches{"\n"}
            • Weekend Practice Matches{"\n"}
            • Bowling Machine Sessions{"\n"}
            • Video Analysis
          </Text>
        </Card.Content>
      </Card>

      <Text style={styles.sectionHeading}>Elite Training Centres</Text>

      <Card style={styles.centerCard}>
        <Card.Content>
          <Text style={styles.centerName}>Main Cricket Academy</Text>
          <Text style={styles.body}>
            Replace with backend academy address.
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        style={styles.callButton}
        onPress={handleCall}>
        Call Academy
      </Button>

      <Button
        mode="outlined"
        style={styles.whatsappButton}
        onPress={handleWhatsApp}>
        WhatsApp Enquiry
      </Button>

      <Text style={styles.footer}>
        MVP Version — Academy details can later be loaded from backend.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F5F5F5'},
  content:{padding:16,paddingBottom:40},
  header:{marginBottom:16},
  title:{fontSize:26,fontWeight:'700',color:'#212121'},
  subtitle:{fontSize:14,color:'#666'},
  heroCard:{borderRadius:14,overflow:'hidden',marginBottom:18},
  image:{height:180,width:'100%'},
  badge:{position:'absolute',top:12,left:12,backgroundColor:'#D32F2F'},
  courseTitle:{fontSize:20,fontWeight:'700',marginVertical:10},
  coachCard:{backgroundColor:'#F2F2F2',padding:12,borderRadius:10,marginTop:12},
  coachTitle:{fontWeight:'700'},
  sectionCard:{borderRadius:14,marginBottom:18},
  sectionTitle:{fontSize:17,fontWeight:'700',marginTop:12},
  body:{fontSize:14,lineHeight:22,color:'#555',marginTop:6},
  sectionHeading:{fontSize:20,fontWeight:'700',marginBottom:10},
  centerCard:{borderRadius:12,marginBottom:20},
  centerName:{fontWeight:'700',fontSize:16},
  callButton:{marginBottom:12},
  whatsappButton:{marginBottom:16},
  footer:{textAlign:'center',color:'#777',fontSize:12}
});
