document.addEventListener('DOMContentLoaded', () => {
    const qnaForm = document.getElementById('qnaForm');

    qnaForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(qnaForm);

        try {
            // Ensure that the 'answer' field is included in the form data
            if (!formData.get('answer')) {
                alert('Please provide an answer.');
                return;
            }

            const response = await fetch('/qna/addQna', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                alert('Q&A submitted successfully!');
                qnaForm.reset();
                quill.root.innerHTML = '';
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error submitting Q&A:', error);
            alert('An error occurred while submitting the Q&A. Please try again.');
        }
    });
});
