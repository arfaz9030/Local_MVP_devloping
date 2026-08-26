import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, Portal, Text } from 'react-native-paper';
import OTPInput from '../components/OTPInput';
import PhoneInput from '../components/PhoneInput';
import SurveyDialog from '../components/SurveyDialog';
import { authApi } from '../src/auth/authAPI';
import { useAuth } from './_layout';

const { width, height } = Dimensions.get('window');
type OnboardingStep = 'PROMO' | 'TRUECALLER' | 'LOGIN_OPTIONS' | 'OTP_INPUT' | 'WAITING' | 'SURVEY';

export default function OnboardingScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('PROMO');
  const [phoneNumber, setPhoneNumber] = useState('7680922101');
  const [otpError, setOtpError] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const handleTruecallerVerify = async () => {
    setStep('WAITING');
    try {
      console.log("STEP 2 - Calling verifyMobile()");
      const response = await authApi.verifyMobile(phoneNumber);
      console.log("STEP 3 - API Response", response);
      // if (response.success) {
      //   setTimeout(() => {
      //     setStep('SURVEY');
      //   }, 1500);
      // }
      console.log("OTP Generated Successfully");

      setTimeout(() => {
        setStep('OTP_INPUT');
      }, 500);
    } catch (error) {
      setStep('LOGIN_OPTIONS');
    }
  };

  // const handleManualPhoneSubmit = () => {
  //   setStep('OTP_INPUT');
  // };
  const handleManualPhoneSubmit = async () => {
    try {
      console.log("Calling request-otp API for:", phoneNumber);

      setStep('WAITING');

      const response = await authApi.verifyMobile(phoneNumber);

      console.log("Request OTP Response:", response);

      // Backend returned successfully
      setStep('OTP_INPUT');

    } catch (error) {
      console.error("Request OTP Failed:", error);

      setStep('LOGIN_OPTIONS');
    }
  }

  const handleOtpVerify = async () => {
    // Show the existing loading screen while OTP verification is running.
    setStep('WAITING');
    try {
      // Send the entered 5-digit OTP to the existing backend API.
      const response = await authApi.verifyOTP(phoneNumber, otpCode);

      // Log only the response during development.
      // Do NOT log the JWT token.
      console.log("Verify OTP Response:", response);

      // A successful response must contain the JWT and user ID.
      if (response.token && response.userId) {
        // Continue to the existing survey flow.
        setTimeout(() => {
          setStep("SURVEY");
        }, 500);
      } else {
        // The API responded successfully but did not provide
        // the authentication data required by the frontend.
        setOtpError('Invalid OTP. Please check the code and try again.');


        // Keep the user on the OTP screen so they can try again.
        setStep("OTP_INPUT");
      }

    } catch (error) {
      console.error("Verify OTP Error:", error);

      Alert.alert("Invalid OTP", "OTP verification failed.");

      setStep("OTP_INPUT");

    }
  };

  const handleSkipOrComplete = () => {
    login(); // Alters root context state, which triggers useSegments redirection hook in app/_layout.tsx
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container} id="onboarding-root">
      {/* 1. Promotional Splash / Promo Screen */}
      {step === 'PROMO' && (
        <View style={styles.promoContainer} id="step-promo">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800' }}
            style={styles.promoImage}
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBallIcon}>
                <View style={styles.cricketBallSeam} />
              </View>
              <Text style={styles.logoMainText}>cricheroes</Text>
              <Text style={styles.logoTagline}>Your cricket matters</Text>
            </View>

            <View style={styles.promoTextGroup}>
              <Text style={styles.introHeading}>Introducing</Text>
              <Text style={styles.willowHeading}>English Willow Bats</Text>
            </View>

            <Button
              mode="contained"
              onPress={() => setStep('TRUECALLER')}
              style={styles.startBtn}
              buttonColor="#d32f2f"
              textColor="#ffffff"
              id="promo-start-btn"
            >
              Get Started
            </Button>
          </View>
        </View>
      )}

      {/* 2. Truecaller Quick Login Popup Dialog */}
      {step === 'TRUECALLER' && (
        <View style={styles.centeredView} id="step-truecaller">
          <View style={styles.topBrandLogo}>
            <View style={styles.redIconBadge} />
            <Text style={styles.brandTitleText}>cricheroes</Text>
            <Text style={styles.brandSubtitleText}>Your cricket matters</Text>
          </View>

          <Portal>
            <Dialog visible={step === 'TRUECALLER'} onDismiss={() => setStep('LOGIN_OPTIONS')} style={styles.tcDialog}>
              <Dialog.Title style={styles.tcDialogTitle}>Hi, Arfaz Mohammad</Dialog.Title>
              <Dialog.Content>
                <Text style={styles.tcDialogSub}>To get started, please verify mobile number</Text>

                <Button
                  mode="contained"
                  onPress={handleTruecallerVerify}
                  style={styles.tcActionBtn}
                  buttonColor="#1d978e"
                  id="tc-use-number-btn"
                >
                  USE 7680922101
                </Button>

                <Button
                  mode="text"
                  onPress={() => setStep('LOGIN_OPTIONS')}
                  textColor="#757575"
                  style={styles.tcAnotherBtn}
                  id="tc-another-number-btn"
                >
                  USE ANOTHER MOBILE NUMBER
                </Button>
              </Dialog.Content>
              <View style={styles.tcFooter}>
                <Text style={styles.tcFooterDisclaimer}>
                  By continuing you consent to share your Truecaller profile information with CricHeroes.
                </Text>
                <Text style={styles.tcInstantVerify}>Instant Verification by Truecaller</Text>
              </View>
            </Dialog>
          </Portal>
        </View>
      )}

      {/* 3. Manual Phone Gateway */}
      {step === 'LOGIN_OPTIONS' && (
        <ScrollView contentContainerStyle={styles.scrollContent} id="step-login-options">
          <View style={styles.topBrandLogo}>
            <View style={styles.redIconBadge} />
            <Text style={styles.brandTitleText}>cricheroes</Text>
            <Text style={styles.brandSubtitleText}>Your cricket matters</Text>
          </View>

          <View style={styles.authForm}>
            <PhoneInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              onSubmit={handleManualPhoneSubmit}
            />

            <View style={styles.orDividerRow}>
              <View style={styles.thinGreyLine} />
              <Text style={styles.dividerLabelText}>Login with</Text>
              <View style={styles.thinGreyLine} />
            </View>

            <Button
              mode="contained"
              icon="whatsapp"
              onPress={handleManualPhoneSubmit}
              style={styles.authOptionBtn}
              buttonColor="#128C7E"
              id="whatsapp-login-btn"
            >
              WhatsApp
            </Button>

            <Button
              mode="outlined"
              icon="cellphone"
              onPress={handleManualPhoneSubmit}
              style={[styles.authOptionBtn, { borderColor: '#b0bec5' }]}
              textColor="#37474f"
              id="mobile-login-btn"
            >
              Mobile number
            </Button>

            <Text style={styles.termsNoteText}>
              By signing in, you agree to our terms of service and privacy policy.
            </Text>

            <Button
              mode="text"
              onPress={handleSkipOrComplete}
              textColor="#1d978e"
              style={styles.guestLinkBtn}
              id="explore-guest-btn"
            >
              Explore as a guest
            </Button>
          </View>
        </ScrollView>
      )}

      {/* 4. Manual OTP Screen */}
      {step === 'OTP_INPUT' && (
        <View style={styles.centeredView} id="step-otp-input">
          <Text style={styles.otpHeader}>Verify OTP</Text>
          <Text style={styles.otpSub}>We have sent a verification code to {phoneNumber}</Text>

          <OTPInput value={otpCode} onChange={setOtpCode} />

          <Button
            mode="contained"
            onPress={handleOtpVerify}
            style={styles.otpSubmitBtn}
            buttonColor="#1d978e"
            disabled={otpCode.length < 5}
            id="otp-verify-btn"
          >
            Verify & Proceed
          </Button>

          <Button mode="text" onPress={() => setStep('LOGIN_OPTIONS')} textColor="#757575" id="otp-back-btn">
            Back to login
          </Button>
        </View>
      )}

      {/* 5. Custom Please Wait Loader Overlay */}
      {step === 'WAITING' && (
        <Portal>
          <Dialog visible={true} dismissable={false} style={styles.waitDialog}>
            <Dialog.Content style={styles.waitDialogContent}>
              <Text style={styles.waitHeader}>Hi, Arfaz Mohammad</Text>
              <ActivityIndicator animating={true} color="#1d978e" size="large" style={styles.waitSpinner} />
              <Button mode="contained" buttonColor="#1d978e" style={styles.waitDisabledBtn} disabled>
                PLEASE WAIT...
              </Button>
            </Dialog.Content>
          </Dialog>
        </Portal>
      )}

      {/* 6. Feedback Survey Overlay */}
      {step === 'SURVEY' && (
        <SurveyDialog
          visible={true}
          onDismiss={handleSkipOrComplete}
          onStartSurvey={handleSkipOrComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  promoContainer: {
    flex: 1,
  },
  promoImage: {
    width: width,
    height: height,
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoBallIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cricketBallSeam: {
    width: 2,
    height: 70,
    backgroundColor: '#ffffff',
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  logoMainText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
    letterSpacing: -0.5,
  },
  logoTagline: {
    fontSize: 13,
    color: '#bdbdbd',
  },
  promoTextGroup: {
    alignItems: 'center',
  },
  introHeading: {
    fontSize: 20,
    color: '#ffffff',
  },
  willowHeading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 6,
  },
  startBtn: {
    borderRadius: 8,
    paddingVertical: 4,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  topBrandLogo: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  redIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d32f2f',
  },
  brandTitleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
  },
  brandSubtitleText: {
    fontSize: 11,
    color: '#757575',
  },
  tcDialog: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
  },
  tcDialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  tcDialogSub: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 16,
  },
  tcActionBtn: {
    borderRadius: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  tcAnotherBtn: {
    marginBottom: 6,
  },
  tcFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
    paddingTop: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  tcFooterDisclaimer: {
    fontSize: 10,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 14,
  },
  tcInstantVerify: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0288d1',
    marginTop: 6,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  authForm: {
    flex: 1,
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  thinGreyLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerLabelText: {
    marginHorizontal: 10,
    color: '#757575',
    fontSize: 13,
  },
  authOptionBtn: {
    borderRadius: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  termsNoteText: {
    fontSize: 11,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 15,
    marginBottom: 20,
  },
  guestLinkBtn: {
    alignSelf: 'center',
  },
  otpHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
  },
  otpSub: {
    fontSize: 13,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  otpSubmitBtn: {
    width: '100%',
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  waitDialog: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignSelf: 'center',
    width: width * 0.8,
  },
  waitDialogContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  waitHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  waitSpinner: {
    marginVertical: 20,
  },
  waitDisabledBtn: {
    width: '100%',
    borderRadius: 8,
  },
});