import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const STORAGE_KEY = '@todo_tasks';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CosmogenIusTodoList = () => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('PM');

  useEffect(() => {
    loadTasks();
    registerForPushNotifications();
  }, []);

  // Register for push notifications - fixed version
  const registerForPushNotifications = async () => {
    try {
      // The new way to request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      // If we don't have permission, ask for it
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      // If we still don't have permission, show an alert
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Notification Permission Required',
          'Please enable notifications to receive task reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
    } catch (error) {
      console.error('Error getting notification permission:', error);
    }
  };

  // Schedule a notification for a task
  const scheduleNotification = async (taskText, timeString) => {
    try {
      // Parse the time string to get hours and minutes
      const [time, period] = timeString.split(' ');
      let [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
      
      // Convert to 24-hour format
      if (period === 'PM' && hours < 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      // Create a Date object for the notification time
      const now = new Date();
      const scheduledTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes
      );
      
      // If the time has already passed today, schedule for tomorrow
      if (scheduledTime < now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      // Calculate seconds until the notification
      const secondsUntilNotification = Math.floor((scheduledTime - now) / 1000);
      
      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder',
          body: taskText,
          sound: true,
        },
        trigger: {
          seconds: secondsUntilNotification,
        },
      });
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  };

  // Cancel a scheduled notification
  const cancelNotification = async (notificationId) => {
    try {
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        const currentTime = Date.now();
        const filteredTasks = parsedTasks.filter(task => {
          const taskAge = currentTime - parseInt(task.id);
          return taskAge < 24 * 60 * 60 * 1000;
        });
        setTasks(filteredTasks);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const addTask = async () => {
    if (task.trim()) {
      const timeString = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
      
      // Schedule notification and get the notification ID
      const notificationId = await scheduleNotification(task, timeString);
      
      const newTask = {
        id: Date.now().toString(),
        text: task,
        time: timeString,
        completed: false,
        notificationId: notificationId
      };
      
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      await saveTasks(updatedTasks);
      setTask('');
      setShowTimePicker(false);
    }
  };

  // Fixed toggleTaskCompletion function
  const toggleTaskCompletion = async (id) => {
    try {
      const updatedTasks = tasks.map(t => {
        if (t.id === id) {
          // If task is being marked as completed, cancel its notification
          if (!t.completed && t.notificationId) {
            cancelNotification(t.notificationId);
          }
          
          return { ...t, completed: !t.completed };
        }
        return t;
      });
      
      setTasks(updatedTasks);
      await saveTasks(updatedTasks);
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      // Find the task being deleted to cancel its notification
      const taskToDelete = tasks.find(t => t.id === id);
      if (taskToDelete && taskToDelete.notificationId) {
        await cancelNotification(taskToDelete.notificationId);
      }
      
      const updatedTasks = tasks.filter(t => t.id !== id);
      setTasks(updatedTasks);
      await saveTasks(updatedTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const renderTimePickerModal = () => (
    <Modal
      visible={showTimePicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Time</Text>
          
          <View style={styles.timePickerContainer}>
            {/* Hours */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Hour</Text>
              <ScrollView style={styles.scrollPicker}>
                {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.timeOption,
                      selectedHour === hour && styles.selectedTimeOption
                    ]}
                    onPress={() => setSelectedHour(hour)}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      selectedHour === hour && styles.selectedTimeOptionText
                    ]}>
                      {hour}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Minutes */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Minute</Text>
              <ScrollView style={styles.scrollPicker}>
                {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map((minute) => (
                  <TouchableOpacity
                    key={minute}
                    style={[
                      styles.timeOption,
                      selectedMinute === minute && styles.selectedTimeOption
                    ]}
                    onPress={() => setSelectedMinute(minute)}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      selectedMinute === minute && styles.selectedTimeOptionText
                    ]}>
                      {minute}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* AM/PM */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Period</Text>
              <View style={styles.periodContainer}>
                {['AM', 'PM'].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodOption,
                      selectedPeriod === period && styles.selectedPeriodOption
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text style={[
                      styles.periodOptionText,
                      selectedPeriod === period && styles.selectedPeriodOptionText
                    ]}>
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={addTask}
            >
              <Text style={styles.confirmButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderTask = useCallback(({ item }) => (
    <View style={styles.taskContainer}>
      <TouchableOpacity 
        style={[styles.checkbox, item.completed && styles.checkedCheckbox]}
        onPress={() => toggleTaskCompletion(item.id)}
      />
      <View style={styles.taskTextContainer}>
        <Text style={[styles.taskText, item.completed && styles.completedTaskText]}>
          {item.text}
        </Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => deleteTask(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  ), [tasks]); // Added tasks as a dependency to ensure re-rendering

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Daily Task List</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a new task"
          placeholderTextColor="gray"
          value={task}
          onChangeText={setTask}
          onSubmitEditing={() => task.trim() && setShowTimePicker(true)}
        />
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => task.trim() && setShowTimePicker(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        style={styles.taskList}
        extraData={tasks} // Added to ensure re-rendering when tasks change
      />

      {renderTimePickerModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'black'
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black'
  },
  inputContainer: {
    flexDirection: 'row',
    margin: 20,
    alignItems: 'center'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 5,
    color: 'black'
  },
  addButton: {
    backgroundColor: 'black',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonText: {
    color: 'white',
    fontSize: 30
  },
  taskList: {
    paddingHorizontal: 20
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black'
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'black',
    marginRight: 15,
    borderRadius: 4
  },
  checkedCheckbox: {
    backgroundColor: 'black'
  },
  taskTextContainer: {
    flex: 1
  },
  taskText: {
    fontSize: 16,
    color: 'black'
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: 'gray'
  },
  timeText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4
  },
  deleteButton: {
    padding: 5
  },
  deleteButtonText: {
    color: 'black',
    fontSize: 18
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: 'black'
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center'
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: 'black'
  },
  scrollPicker: {
    height: 200
  },
  timeOption: {
    padding: 10,
    alignItems: 'center'
  },
  selectedTimeOption: {
    backgroundColor: 'black',
    borderRadius: 5
  },
  timeOptionText: {
    fontSize: 18,
    color: 'black'
  },
  selectedTimeOptionText: {
    color: 'white'
  },
  periodContainer: {
    marginTop: 10
  },
  periodOption: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black'
  },
  selectedPeriodOption: {
    backgroundColor: 'black'
  },
  periodOptionText: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center'
  },
  selectedPeriodOptionText: {
    color: 'white'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5
  },
  cancelButton: {
    backgroundColor: '#f0f0f0'
  },
  confirmButton: {
    backgroundColor: 'black'
  },
  cancelButtonText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 16
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16
  }
});

export default CosmogenIusTodoList;