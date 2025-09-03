const { User, Profile, ContactInformation, Address, EmergencyContact, Patient, Doctor } = require('../models');
const bcrypt = require('bcrypt');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Profile,
          required: false
        },
        {
          model: ContactInformation,
          required: false
        },
        {
          model: Address,
          required: false
        },
        {
          model: EmergencyContact,
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive information
    const userProfile = {
      id: user.id,
      email: user.email,
      user_type_id: user.user_type_id,
      Profile: user.Profile,
      ContactInformation: user.ContactInformation,
      Address: user.Address,
      EmergencyContact: user.EmergencyContact
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { 
      first_name, 
      last_name, 
      phone_number, 
      date_of_birth, 
      address, 
      emergency_contact 
    } = req.body;

    const user = await User.findByPk(userId, {
      include: [Profile, ContactInformation, Address, EmergencyContact]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update or create profile
    if (user.Profile) {
      await user.Profile.update({
        first_name: first_name || user.Profile.first_name,
        last_name: last_name || user.Profile.last_name,
        date_of_birth: date_of_birth || user.Profile.date_of_birth
      });
    } else {
      await Profile.create({
        user_id: userId,
        first_name,
        last_name,
        date_of_birth
      });
    }

    // Update or create contact information
    if (user.ContactInformation) {
      await user.ContactInformation.update({
        phone_number: phone_number || user.ContactInformation.phone_number
      });
    } else {
      await ContactInformation.create({
        user_id: userId,
        phone_number
      });
    }

    // Update or create address
    if (user.Address) {
      await user.Address.update({
        address: address || user.Address.address
      });
    } else {
      await Address.create({
        user_id: userId,
        address
      });
    }

    // Update or create emergency contact
    if (user.EmergencyContact) {
      await user.EmergencyContact.update({
        emergency_contact: emergency_contact || user.EmergencyContact.emergency_contact
      });
    } else {
      await EmergencyContact.create({
        user_id: userId,
        emergency_contact
      });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const { current_password, new_password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await user.update({ password: hashedNewPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.user;
    const { email_reminders, sms_reminders, appointment_updates, prescription_ready } = req.body;

    // This would typically be stored in a user preferences table
    // For now, we'll just return success
    res.json({ 
      message: 'Notification preferences updated',
      preferences: {
        email_reminders,
        sms_reminders,
        appointment_updates,
        prescription_ready
      }
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user type specific data
exports.getUserTypeData = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let typeData = null;

    if (user.user_type_id === 2) { // Patient
      const patient = await Patient.findOne({
        where: { user_id: userId },
        include: [User]
      });
      typeData = patient;
    } else if (user.user_type_id === 3) { // Doctor
      const doctor = await Doctor.findOne({
        where: { user_id: userId },
        include: [User]
      });
      typeData = doctor;
    }

    res.json({ user_type_id: user.user_type_id, typeData });
  } catch (error) {
    console.error('Error fetching user type data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
