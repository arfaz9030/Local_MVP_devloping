import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Menu, Text, TextInput, TouchableRipple } from 'react-native-paper';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

export default function PhoneInput({ value, onChangeText, onSubmit }: PhoneInputProps) {
  const [visible, setVisible] = React.useState(false);
  const [country, setCountry] = React.useState({ name: 'India', code: '+91', flag: '🇮🇳' });

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const selectCountry = (name: string, code: string, flag: string) => {
    setCountry({ name, code, flag });
    closeMenu();
  };

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <TouchableRipple onPress={openMenu} style={styles.countryPicker}>
            <View style={styles.pickerContent}>
              <Text style={styles.flag}>{country.flag}</Text>
              <Text style={styles.code}>{country.code}</Text>
              <TextInput.Icon icon="chevron-down" size={20} />
            </View>
          </TouchableRipple>
        }
      >
        <Menu.Item onPress={() => selectCountry('India', '+91', '🇮🇳')} title="India (+91)" />
        <Menu.Item onPress={() => selectCountry('United Kingdom', '+44', '🇬🇧')} title="United Kingdom (+44)" />
        <Menu.Item onPress={() => selectCountry('Australia', '+61', '🇦🇺')} title="Australia (+61)" />
        <Menu.Item onPress={() => selectCountry('South Africa', '+27', '🇿🇦')} title="South Africa (+27)" />
      </Menu>

      <TextInput
        mode="outlined"
        label="Phone number"
        value={value}
        onChangeText={onChangeText}
        keyboardType="phone-pad"
        style={styles.input}
        outlineColor="#bdbdbd"
        activeOutlineColor="#009688"
        textColor="#000"     // <-- Add this
        onSubmitEditing={onSubmit}
        right={<TextInput.Icon icon="phone" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  countryPicker: {
    height: 56,
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginRight: 8,
    marginTop: 6,
    backgroundColor: '#fafafa',
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 20,
    marginRight: 4,
  },
  code: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
    marginRight: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});