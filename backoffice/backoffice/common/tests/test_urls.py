from django.urls import reverse


def test_home_redirects_to_admin(client, db):
    response = client.get(reverse("home"))

    assert response.status_code == 302
    assert response.url == reverse("admin:index")
