

var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  },
  template: `
    <div>
      {{ message }}
    </div>
  `,
});

Vue.component('course-listing-item', {
  props: {
    course: {
      type: Object
    }
  },
  template: `
    <div class="col-lg-3 col-md-6 mb-4">
      <div class="card h-100">
        <img class="card-img-top" src="http://placehold.it/500x325" alt="">
        <div class="card-body">
          <h4 class="card-title">{{ course.name }}</h4>
          <p style="text-align: left" class="card-text">Number of TA: {{ course.numTaActive }}
          <br> Number of students: {{ course.numStudentActive }}</p>
        </div>
        <div class="card-footer">
          <a href="#" class="btn btn-primary btn-lg">Join</a>
        </div>
      </div>
    </div>
  `,
});

var course_listing = new Vue({
  el: '#course-listing',
  data: {
    courses: [
      {
        name: 'cs155',
        numTaActive: 10,
        numStudentActive: 1,
      },
      {
        name: 'cs156',
        numTaActive: 10,
        numStudentActive: 1,
      },
      {
        name: 'cs310',
        numTaActive: 10,
        numStudentActive: 1,
      },
      {
        name: 'ecen',
        numTaActive: 10,
        numStudentActive: 1,
      },
      {
        name: 'ecen',
        numTaActive: 10,
        numStudentActive: 1,
      }
    ]
  }
});

var explore_section = new Vue({
  el: '#explore-section',
  data: {
    explores: {
      'Student' :[
        {
          title: 'Events',
          href: '/eventchain',
          pin: 'https://www.leedsandyorkpft.nhs.uk/news/wp-content/uploads/sites/4/2017/03/events-icon-680x680.jpg'
        }
      ],
      'Teaching Assistants' :[
        {
          title: 'Networkflow',
          href: 'https://datduyng.github.io/networkflow/simulation.html',
          pin: 'https://user-images.githubusercontent.com/35666615/52318190-de194580-2988-11e9-929d-09aec2551b13.png'
        },
        {
          title: 'Networkflow',
          href: 'https://datduyng.github.io/networkflow/simulation.html',
          pin: 'https://user-images.githubusercontent.com/35666615/52318190-de194580-2988-11e9-929d-09aec2551b13.png'
        },
        {
          title: 'Networkflow',
          href: 'https://datduyng.github.io/networkflow/simulation.html',
          pin: 'https://user-images.githubusercontent.com/35666615/52318190-de194580-2988-11e9-929d-09aec2551b13.png'
        },
      ],
    }
  }
});



function userLogout() {
  console.log('logout');
  $.post('/logout', {});
  window.location.href = "https://canvas.instructure.com/";
}