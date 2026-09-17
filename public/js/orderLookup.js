document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('orderIdInput');
  const button = document.getElementById('lookupBtn');
  const result = document.getElementById('lookupResult');

  button.addEventListener('click', async () => {
    const id = input.value;

    if (!id) {
      result.textContent = 'Enter an order ID first.';
      return;
    }

    result.textContent = 'Looking up...';

    try {
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();

      if (!response.ok) {
        result.textContent = data.error;
        return;
      }

      const total = (data.price_at_order * data.quantity).toFixed(2);
      result.textContent = `${data.item_name} × ${data.quantity} — Nu. ${total} (${data.status})`;
    } catch (err) {
      result.textContent = 'Something went wrong. Try again.';
    }
  });
});
