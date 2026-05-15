document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;


        // Create participants list HTML with delete icon
        let participantsHtml = "<ul class='participants-list'>";
        if (details.participants.length > 0) {
          details.participants.forEach((participant) => {
            participantsHtml += `<li class="participant-item">
              <span class="participant-email">${participant}</span>
              <button class="delete-participant" title="Remove participant" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(participant)}">
                <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='none' viewBox='0 0 24 24'><path fill='#c62828' d='M7 21q-.825 0-1.413-.588Q5 19.825 5 19V7H4V5h5V4h6v1h5v2h-1v12q0 .825-.587 1.412Q17.825 21 17 21Zm10-14H7v12q0 .425.288.712Q7.575 20 8 20h8q.425 0 .713-.288Q17 19.425 17 19ZM9 18h2v-8H9Zm4 0h2v-8h-2Z'/></svg>
              </button>
            </li>`;
          });
        } else {
          participantsHtml += '<li class="no-participants">No one signed up yet</li>';
        }
        participantsHtml += '</ul>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
            ${participantsHtml}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add event listeners for delete buttons
        activityCard.querySelectorAll('.delete-participant').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const activity = decodeURIComponent(btn.getAttribute('data-activity'));
            const email = decodeURIComponent(btn.getAttribute('data-email'));
            if (confirm(`Remove ${email} from ${activity}?`)) {
              try {
                const resp = await fetch(`/activities/${encodeURIComponent(activity)}/participant?email=${encodeURIComponent(email)}`, {
                  method: 'DELETE'
                });
                const result = await resp.json();
                if (resp.ok) {
                  fetchActivities();
                } else {
                  alert(result.detail || 'Error removing participant');
                }
              } catch (err) {
                alert('Error removing participant');
              }
            }
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
