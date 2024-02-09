document.addEventListener('DOMContentLoaded', async () => {
    const qnaTableBody = document.querySelector('#qnaTable tbody');

    console.log('Fetching existing Q&A pairs...');
    await fetchExistingQnaPairs();

    async function fetchExistingQnaPairs() {
        try {
            const response = await fetch('/qna/getAllQna');
            const data = await response.json();

            console.log('Fetched Q&A pairs:', data);

            // Clear existing rows in the table
            qnaTableBody.innerHTML = '';

            // Populate the table with existing Q&A pairs
            data.forEach(entry => updateQnaTable(entry));
        } catch (error) {
            console.error('Error fetching existing Q&A pairs:', error);
        }
    }

    function updateQnaTable({ _id, question, answer, images }) {
        const newRow = qnaTableBody.insertRow();
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        const cell4 = newRow.insertCell(3);

        cell1.textContent = question;

        // Use Quill to display formatted text
        const answerContainer = document.createElement('div');
        answerContainer.innerHTML = answer;
        cell2.appendChild(answerContainer);

        // Display images if available
        if (images && images.length > 0) {
            images.forEach(image => {
                const imageElement = document.createElement('img');
                imageElement.src = `../../uploads/${image}`;
                imageElement.alt = 'Q&A Image';
                cell3.appendChild(imageElement);
            });
        } else {
            cell3.textContent = 'N/A';
        }

        // Add Edit and Delete buttons with text
        const editButton = createTextButton('Edit', () => editQna(_id, question, answer, images));
        cell4.appendChild(editButton);

        const deleteButton = createTextButton('Delete', () => deleteQna(_id));
        cell4.appendChild(deleteButton);
    }

    function createTextButton(text, clickHandler) {
        const button = document.createElement('button');
        button.textContent = text;
        button.addEventListener('click', clickHandler);
        return button;
    }

    async function editQna(id, question, answer, images) {
        const updatedQuestion = prompt('Update the question:', question);
        const updatedAnswer = prompt('Update the answer:', answer);
        const updatedImages = prompt('Update the images (comma-separated URLs):', images.join(', '));

        if (updatedQuestion !== null && updatedAnswer !== null) {
            try {
                const response = await fetch('/qna/updateQna', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id,
                        question: updatedQuestion,
                        answer: updatedAnswer,
                        images: updatedImages.split(',').map(url => url.trim()),
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    console.log('Q&A pair updated successfully');
                    await fetchExistingQnaPairs();
                } else {
                    console.error('Error updating Q&A pair:', result.error);
                }
            } catch (error) {
                console.error('Error updating Q&A pair:', error);
            }
        }
    }

    async function deleteQna(id) {
        const confirmation = confirm('Are you sure you want to delete this Q&A pair?');

        if (confirmation) {
            try {
                const response = await fetch(`/qna/deleteQna/${id}`, {
                    method: 'DELETE',
                });

                const result = await response.json();

                if (result.success) {
                    console.log('Q&A pair deleted successfully');
                    await fetchExistingQnaPairs();
                } else {
                    console.error('Error deleting Q&A pair:', result.error);
                }
            } catch (error) {
                console.error('Error deleting Q&A pair:', error);
            }
        }
    }
});
