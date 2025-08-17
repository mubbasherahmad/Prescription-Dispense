import Toast from './Toast';

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-0 right-0 p-4 space-y-4 z-50">
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          toast={{ ...toast, index }}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;