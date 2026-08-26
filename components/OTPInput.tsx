import React, { useRef, useState } from 'react';
import { TextInput as NativeTextInput, StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';

interface OTPInputProps {
  value: string;
  onChange: (code: string) => void;
}

export default function OTPInput({ value, onChange }: OTPInputProps) {
  const [code, setCode] = useState(['', '', '', '', '']);
  const inputs = useRef<Array<NativeTextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    onChange(newCode.join(''));

    // Move to next input if filled
    if (text && index < 4) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container} id="otp-input-container">
      {code.map((digit, index) => (
        <TextInput
          key={index}
          id={`otp-box-${index}`}
          mode="outlined"
          value={digit}
          onChangeText={(text) => handleChange(text.slice(-1), index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          style={styles.otpBox}
          textAlign="center"
          outlineColor="#bdbdbd"
          activeOutlineColor="#009688"
          ref={(ref: any) => {
            inputs.current[index] = ref;
          }}
          maxLength={1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignSelf: 'center',
    marginVertical: 30,
  },
  otpBox: {
    width: 50,
    height: 56,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#009688',
    backgroundColor: '#ffffff',
  },
});