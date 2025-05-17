import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'sonner';

// State is empty since we don't need to store notifications
interface NotificationsState {}

const initialState: NotificationsState = {};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<any>) => {
      const { type = 'default', ...args } = action.payload;

      // Call the appropriate toast function directly with the payload
      switch (type) {
        case 'success':
          toast.success(args.message, args.options);
          break;
        case 'error':
          toast.error(args.message, args.options);
          break;
        case 'warning':
          toast.warning(args.message, args.options);
          break;
        case 'info':
          toast.info(args.message, args.options);
          break;
        case 'promise':
          toast.promise(args.promise, args.options);
          break;
        default:
          toast(args.message, args.options);
      }

      // For debugging
      console.log('Toast:', type, args);
    },
  },
});

export const { showNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
