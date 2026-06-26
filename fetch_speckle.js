const url = "https://app.speckle.systems/graphql";

const query = `
query {
  project(id: "66b23fc631") {
    object(id: "ba74b778ac9a042eb9bd634b7d60f945") {
      id
      children(limit: 50) {
        objects {
          id
          data
        }
      }
    }
  }
}
`;

fetch(url, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 80e11e52ba4d9ed2d2fc14915f937fe13f7ec15a1d'
  },
  body: JSON.stringify({ query })
})
.then(res => res.json())
.then(data => {
  const objects = data.data.project.object.children.objects;
  objects.forEach(obj => {
    if (obj.data.name) {
      console.log(obj.data.name, obj.id);
    } else {
      console.log("No name", obj.id);
    }
  });
});
