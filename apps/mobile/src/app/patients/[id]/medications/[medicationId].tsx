import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMedication, useDeleteMedication } from '../../../../features/medications/medications-api';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';
import { GradientHeader } from '../../../../components/ui/GradientHeader';
import { useTheme } from '../../../../hooks/useTheme';
import { Colors } from '../../../../constants/theme';
import { Clock, Calendar as CalendarIcon, Info, AlertTriangle, Edit2, Trash2 } from 'lucide-react-native';

export default function MedicationDetailsScreen() {
  const { id: patientId, medicationId } = useLocalSearchParams<{ id: string; medicationId: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  
  const { data: medication, isLoading, error } = useMedication(medicationId as string);
  const deleteMutation = useDeleteMedication();

  if (isLoading) return <LoadingSpinner />;
  if (error || !medication) return <EmptyState message="Medication not found." />;

  const handleDelete = () => {
    Alert.alert(
      "Remove Medication",
      "Are you sure you want to remove this medication?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: () => {
            deleteMutation.mutate({ id: medication.id, patientId: patientId as string }, {
              onSuccess: () => {
                router.back();
              }
            });
          }
        }
      ]
    );
  };

  const formatTimes = (times?: string[]) => {
    if (!times || times.length === 0) return 'Not provided';
    return times.map(t => {
      const [h, m] = t.split(':');
      const d = new Date();
      d.setHours(parseInt(h, 10), parseInt(m, 10));
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }).join(', ');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: theme.backgroundElement,
      padding: 20,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    textContent: {
      flex: 1,
    },
    label: {
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: '600',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    value: {
      fontSize: 16,
      color: theme.text,
      fontWeight: '500',
      lineHeight: 22,
    },
    disclaimerBox: {
      backgroundColor: '#FEF3C7',
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#F59E0B',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    disclaimerText: {
      color: '#92400E',
      fontSize: 14,
      flex: 1,
      marginLeft: 12,
      lineHeight: 20,
    },
    btnRow: {
      flexDirection: 'row',
      gap: 12,
    },
    editBtn: {
      flex: 1,
      backgroundColor: theme.primary,
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    deleteBtn: {
      flex: 1,
      backgroundColor: '#ef444415',
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: '#ef444430',
    },
    editBtnText: {
      color: '#FFF',
      fontWeight: '700',
      fontSize: 16,
    },
    deleteBtnText: {
      color: '#ef4444',
      fontWeight: '700',
      fontSize: 16,
    },
  });

  return (
    <View style={styles.container}>
      <GradientHeader title={medication.name} showBack={true} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconBox}><Info size={20} color={theme.primary} /></View>
            <View style={styles.textContent}>
              <Text style={styles.label}>Dosage</Text>
              <Text style={styles.value}>{medication.dosage || 'Not provided'}</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={styles.iconBox}><CalendarIcon size={20} color={theme.primary} /></View>
            <View style={styles.textContent}>
              <Text style={styles.label}>Days of Week</Text>
              <Text style={styles.value}>{(medication as any).daysOfWeek?.length > 0 ? (medication as any).daysOfWeek.join(', ') : 'Not provided'}</Text>
            </View>
          </View>
          
          <View style={[styles.row, { marginBottom: 0 }]}>
            <View style={styles.iconBox}><Clock size={20} color={theme.primary} /></View>
            <View style={styles.textContent}>
              <Text style={styles.label}>Times of Day</Text>
              <Text style={styles.value}>{formatTimes((medication as any).timesOfDay)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconBox}><CalendarIcon size={20} color={theme.primary} /></View>
            <View style={styles.textContent}>
              <Text style={styles.label}>Duration</Text>
              <Text style={styles.value}>{(medication as any).durationWeeks ? `${(medication as any).durationWeeks} weeks` : 'Ongoing / Not provided'}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.iconBox}><Info size={20} color={theme.primary} /></View>
            <View style={styles.textContent}>
              <Text style={styles.label}>Purpose</Text>
              <Text style={styles.value}>{medication.purpose || 'Not provided'}</Text>
            </View>
          </View>

          <View style={[styles.row, { marginBottom: 0 }]}>
            <View style={styles.iconBox}><AlertTriangle size={20} color={theme.primary} /></View>
            <View style={styles.textContent}>
              <Text style={styles.label}>Side Effects</Text>
              <Text style={styles.value}>{medication.sideEffects || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.disclaimerBox}>
          <AlertTriangle size={24} color="#D97706" />
          <Text style={styles.disclaimerText}>
            This information may be AI-generated for educational purposes only and does not replace professional medical advice.
          </Text>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity 
            style={styles.editBtn} 
            onPress={() => router.push(`/patients/${patientId}/medications/edit/${medication.id}`)}
          >
            <Edit2 size={20} color="#FFF" />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Trash2 size={20} color="#ef4444" />
            <Text style={styles.deleteBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>
    </View>
  );
}
