import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { COLORS } from '../../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../../src/theme/typography';

interface ExtraRunsModalProps {
  visible: boolean;
  title?: string;
  options?: number[];
  onSelectRuns: (runs: number) => void;
  onClose: () => void;
}

export const ExtraRunsModal: React.FC<ExtraRunsModalProps> = ({
  visible,
  title = 'Select Runs Scored',
  options = [5, 7, 8, 9],
  onSelectRuns,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon source="close" size={22} color={COLORS.textDarkSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtext}>
            Choose runs scored off this delivery (e.g. overthrows or penalty):
          </Text>

          <View style={styles.grid}>
            {options.map((run) => (
              <TouchableOpacity
                key={run}
                style={styles.runBtn}
                activeOpacity={0.7}
                onPress={() => {
                  onSelectRuns(run);
                  onClose();
                }}
              >
                <Text style={styles.runBtnText}>{run}</Text>
                <Text style={styles.runSubText}>Runs</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  closeBtn: {
    padding: 2,
  },
  subtext: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDarkSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  runBtn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1.5,
    borderColor: COLORS.brandTeal,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  runBtnText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extraBold,
    color: COLORS.brandTeal,
  },
  runSubText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDarkSecondary,
    marginTop: 2,
  },
});
